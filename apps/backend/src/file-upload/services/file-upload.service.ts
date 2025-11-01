import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { FileAsset, FileAssetStatus } from '../entities/file-asset.entity';
import { UploadJob, UploadJobStatus } from '../entities/upload-job.entity';
import { KnowledgeItem } from '../entities/knowledge-item.entity';
import { InitiateUploadDto, FileCategory } from '../dto/initiate-upload.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { ResumeUploadDto } from '../dto/resume-upload.dto';
import { ListFilesDto } from '../dto/list-files.dto';
import { MinioService } from './minio.service';
import { FileValidationService } from './file-validation.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly chunkUploadTimeout = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectRepository(FileAsset)
    private fileAssetRepository: Repository<FileAsset>,
    @InjectRepository(UploadJob)
    private uploadJobRepository: Repository<UploadJob>,
    @InjectRepository(KnowledgeItem)
    private knowledgeItemRepository: Repository<KnowledgeItem>,
    private minioService: MinioService,
    private fileValidationService: FileValidationService,
    private dataSource: DataSource,
  ) {}

  async initiateUpload(initiateUploadDto: InitiateUploadDto): Promise<{
    uploadJobId: string;
    chunkSize: number;
    totalChunks: number;
    existingFileAsset?: FileAsset;
  }> {
    const { fileName, totalSize, mimeType, fileHash, chunkSize = 1024 * 1024, category, tags, knowledgeItemId, metadata } = initiateUploadDto;

    // Validate file size
    const maxSize = this.fileValidationService.getMaxFileSize();
    if (totalSize > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Check for existing file by hash if provided
    let existingFileAsset: FileAsset | null = null;
    if (fileHash) {
      existingFileAsset = await this.fileAssetRepository.findOne({
        where: { hash: fileHash, status: FileAssetStatus.COMPLETED },
      });
    }

    const totalChunks = Math.ceil(totalSize / chunkSize);

    // Create upload job
    const uploadJob = this.uploadJobRepository.create({
      id: uuidv4(),
      fileName,
      totalSize,
      chunkSize,
      totalChunks,
      status: fileHash && existingFileAsset ? UploadJobStatus.COMPLETED : UploadJobStatus.INITIATED,
      fileHash,
      isResumable: true,
      uploadedChunkHashes: [],
      metadata,
    });

    await this.uploadJobRepository.save(uploadJob);

    // If file already exists, create FileAsset reference
    if (existingFileAsset) {
      uploadJob.fileAssetId = existingFileAsset.id;
      uploadJob.uploadedSize = totalSize;
      uploadJob.completedChunks = totalChunks;
      uploadJob.startedAt = new Date();
      uploadJob.completedAt = new Date();
      await this.uploadJobRepository.save(uploadJob);
    }

    this.logger.log(`Initiated upload for ${fileName}, job ID: ${uploadJob.id}`);

    return {
      uploadJobId: uploadJob.id,
      chunkSize,
      totalChunks,
      existingFileAsset: existingFileAsset || undefined,
    };
  }

  async uploadChunk(uploadChunkDto: UploadChunkDto, fileBuffer: Buffer): Promise<{
    success: boolean;
    chunkNumber: number;
    isComplete: boolean;
    uploadJobStatus: UploadJobStatus;
  }> {
    const { uploadJobId, chunkNumber, chunkHash, isLastChunk } = uploadChunkDto;

    // Get upload job
    const uploadJob = await this.uploadJobRepository.findOne({
      where: { id: uploadJobId },
    });

    if (!uploadJob) {
      throw new NotFoundException('Upload job not found');
    }

    if (uploadJob.status === UploadJobStatus.COMPLETED) {
      throw new BadRequestException('Upload already completed');
    }

    if (uploadJob.status === UploadJobStatus.CANCELLED) {
      throw new BadRequestException('Upload has been cancelled');
    }

    // Validate chunk number
    if (chunkNumber < 0 || chunkNumber >= uploadJob.totalChunks) {
      throw new BadRequestException(`Invalid chunk number: ${chunkNumber}`);
    }

    // Calculate expected chunk size
    const expectedChunkSize = Math.min(
      uploadJob.chunkSize,
      uploadJob.totalSize - (chunkNumber * uploadJob.chunkSize)
    );

    if (fileBuffer.length !== expectedChunkSize && !isLastChunk) {
      throw new BadRequestException(`Chunk size mismatch: expected ${expectedChunkSize}, got ${fileBuffer.length}`);
    }

    // Verify chunk hash if provided
    if (chunkHash) {
      const calculatedHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      if (calculatedHash !== chunkHash) {
        throw new BadRequestException('Chunk hash verification failed');
      }
    }

    // Store chunk in MinIO with temporary path
    const chunkObjectName = `chunks/${uploadJobId}/${chunkNumber}`;
    await this.minioService.uploadFile(chunkObjectName, fileBuffer);

    // Update upload job
    if (!uploadJob.uploadedChunkHashes) {
      uploadJob.uploadedChunkHashes = [];
    }
    uploadJob.uploadedChunkHashes[chunkNumber] = chunkHash || '';
    uploadJob.completedChunks++;
    uploadJob.uploadedSize = (uploadJob.uploadedSize || 0) + fileBuffer.length;
    uploadJob.lastChunkAt = new Date();

    if (uploadJob.status === UploadJobStatus.INITIATED) {
      uploadJob.status = UploadJobStatus.UPLOADING;
      uploadJob.startedAt = new Date();
    }

    await this.uploadJobRepository.save(uploadJob);

    // Check if upload is complete
    const isComplete = uploadJob.completedChunks >= uploadJob.totalChunks;
    if (isComplete || isLastChunk) {
      await this.finalizeUpload(uploadJobId);
    }

    this.logger.log(`Uploaded chunk ${chunkNumber} for job ${uploadJobId}`);

    return {
      success: true,
      chunkNumber,
      isComplete,
      uploadJobStatus: uploadJob.status,
    };
  }

  private async finalizeUpload(uploadJobId: string): Promise<void> {
    const uploadJob = await this.uploadJobRepository.findOne({
      where: { id: uploadJobId },
    });

    if (!uploadJob) {
      throw new NotFoundException('Upload job not found');
    }

    try {
      // Combine all chunks into final file
      const finalBuffer = await this.combineChunks(uploadJobId, uploadJob.totalChunks);
      
      // Validate final file
      const validation = await this.fileValidationService.validateFile(
        finalBuffer,
        uploadJob.fileName,
        uploadJob.metadata?.category as FileCategory
      );

      if (!validation.isValid) {
        throw new BadRequestException(`File validation failed: ${validation.error}`);
      }

      // Calculate file hash
      const fileHash = await this.fileValidationService.calculateFileHash(finalBuffer);
      
      // Check for deduplication
      let fileAsset = await this.fileAssetRepository.findOne({
        where: { hash: fileHash, status: FileAssetStatus.COMPLETED },
      });

      if (!fileAsset) {
        // Upload final file to MinIO
        const storagePath = this.fileValidationService.generateStoragePath(
          uploadJob.fileName,
          fileHash,
          validation.detectedCategory
        );
        
        await this.minioService.uploadFile(storagePath, finalBuffer);

        // Create FileAsset record
        fileAsset = this.fileAssetRepository.create({
          originalName: uploadJob.fileName,
          storagePath,
          mimeType: validation.mimeType,
          size: finalBuffer.length,
          hash: fileHash,
          status: FileAssetStatus.COMPLETED,
          bucketName: this.minioService.getBucketName(),
          chunkSize: uploadJob.chunkSize,
          totalChunks: uploadJob.totalChunks,
          uploadedChunks: uploadJob.totalChunks,
          uploadJobId: uploadJob.id,
          tags: uploadJob.metadata?.tags || [],
          category: uploadJob.metadata?.category || validation.detectedCategory,
          metadata: {
            ...uploadJob.metadata,
            detectedCategory: validation.detectedCategory,
            validation,
          },
        });

        await this.fileAssetRepository.save(fileAsset);
      }

      // Update upload job
      uploadJob.status = UploadJobStatus.COMPLETED;
      uploadJob.fileAssetId = fileAsset.id;
      uploadJob.completedAt = new Date();
      uploadJob.fileHash = fileHash;
      await this.uploadJobRepository.save(uploadJob);

      // Clean up chunks
      await this.cleanupChunks(uploadJobId);

      this.logger.log(`Finalized upload job ${uploadJobId}, file asset ID: ${fileAsset.id}`);
    } catch (error) {
      this.logger.error(`Failed to finalize upload ${uploadJobId}: ${error.message}`);
      uploadJob.status = UploadJobStatus.FAILED;
      uploadJob.errorMessage = error.message;
      await this.uploadJobRepository.save(uploadJob);
      throw error;
    }
  }

  private async combineChunks(uploadJobId: string, totalChunks: number): Promise<Buffer> {
    const chunks: Buffer[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkObjectName = `chunks/${uploadJobId}/${i}`;
      const chunkBuffer = await this.minioService.getFile(chunkObjectName);
      chunks.push(chunkBuffer);
    }

    return Buffer.concat(chunks);
  }

  private async cleanupChunks(uploadJobId: string): Promise<void> {
    try {
      const chunkFiles = await this.minioService.listFiles(`chunks/${uploadJobId}/`);
      for (const file of chunkFiles) {
        if (file.name) {
          await this.minioService.deleteFile(file.name);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup chunks for ${uploadJobId}: ${error.message}`);
    }
  }

  async resumeUpload(resumeUploadDto: ResumeUploadDto): Promise<{
    uploadJob: UploadJob;
    completedChunks: number[];
    canResume: boolean;
  }> {
    const { uploadJobId, fileHash } = resumeUploadDto;

    const uploadJob = await this.uploadJobRepository.findOne({
      where: { id: uploadJobId },
    });

    if (!uploadJob) {
      throw new NotFoundException('Upload job not found');
    }

    if (!uploadJob.isResumable) {
      throw new BadRequestException('Upload is not resumable');
    }

    if (uploadJob.status === UploadJobStatus.COMPLETED) {
      throw new BadRequestException('Upload already completed');
    }

    // Verify file hash if provided
    if (fileHash && uploadJob.fileHash && uploadJob.fileHash !== fileHash) {
      throw new BadRequestException('File hash mismatch');
    }

    // Get completed chunks
    const completedChunks: number[] = [];
    if (uploadJob.uploadedChunkHashes) {
      for (let i = 0; i < uploadJob.uploadedChunkHashes.length; i++) {
        if (uploadJob.uploadedChunkHashes[i]) {
          completedChunks.push(i);
        }
      }
    }

    // Update status to resuming
    uploadJob.status = UploadJobStatus.RESUMING;
    await this.uploadJobRepository.save(uploadJob);

    const canResume = uploadJob.completedChunks < uploadJob.totalChunks;

    return {
      uploadJob,
      completedChunks,
      canResume,
    };
  }

  async cancelUpload(uploadJobId: string): Promise<void> {
    const uploadJob = await this.uploadJobRepository.findOne({
      where: { id: uploadJobId },
    });

    if (!uploadJob) {
      throw new NotFoundException('Upload job not found');
    }

    if (uploadJob.status === UploadJobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed upload');
    }

    uploadJob.status = UploadJobStatus.CANCELLED;
    await this.uploadJobRepository.save(uploadJob);

    // Clean up chunks
    await this.cleanupChunks(uploadJobId);

    this.logger.log(`Cancelled upload job ${uploadJobId}`);
  }

  async listFiles(listFilesDto: ListFilesDto): Promise<{
    files: FileAsset[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      mimeType,
      category,
      status,
      tags,
      knowledgeItemId,
      minSize,
      maxSize,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = listFilesDto;

    const queryBuilder = this.fileAssetRepository
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.knowledgeItem', 'knowledgeItem');

    // Apply filters
    if (search) {
      queryBuilder.andWhere('fileAsset.originalName ILIKE :search', { search: `%${search}%` });
    }

    if (mimeType) {
      queryBuilder.andWhere('fileAsset.mimeType = :mimeType', { mimeType });
    }

    if (category) {
      queryBuilder.andWhere('fileAsset.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('fileAsset.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('file.tags @> :tags', { tags: JSON.stringify(tags) });
    }

    if (knowledgeItemId) {
      queryBuilder.andWhere('fileAsset.knowledgeItemId = :knowledgeItemId', { knowledgeItemId });
    }

    if (minSize) {
      queryBuilder.andWhere('fileAsset.size >= :minSize', { minSize });
    }

    if (maxSize) {
      queryBuilder.andWhere('fileAsset.size <= :maxSize', { maxSize });
    }

    // Apply sorting
    queryBuilder.orderBy(`fileAsset.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [files, total] = await queryBuilder.getManyAndCount();

    return {
      files,
      total,
      page,
      limit,
    };
  }

  async getFileAsset(id: string): Promise<FileAsset> {
    const fileAsset = await this.fileAssetRepository.findOne({
      where: { id },
      relations: ['knowledgeItem'],
    });

    if (!fileAsset) {
      throw new NotFoundException('File asset not found');
    }

    return fileAsset;
  }

  async deleteFileAsset(id: string): Promise<void> {
    const fileAsset = await this.getFileAsset(id);

    // Delete file from MinIO
    try {
      await this.minioService.deleteFile(fileAsset.storagePath);
    } catch (error) {
      this.logger.warn(`Failed to delete file from MinIO: ${error.message}`);
    }

    // Delete database record
    await this.fileAssetRepository.remove(fileAsset);

    this.logger.log(`Deleted file asset ${id}`);
  }

  async getUploadJob(uploadJobId: string): Promise<UploadJob> {
    const uploadJob = await this.uploadJobRepository.findOne({
      where: { id: uploadJobId },
      relations: ['fileAsset'],
    });

    if (!uploadJob) {
      throw new NotFoundException('Upload job not found');
    }

    return uploadJob;
  }

  async getFileDownloadUrl(id: string, expiry: number = 3600): Promise<string> {
    const fileAsset = await this.getFileAsset(id);

    if (fileAsset.status !== FileAssetStatus.COMPLETED) {
      throw new BadRequestException('File is not ready for download');
    }

    return this.minioService.generatePresignedUrl(fileAsset.storagePath, expiry);
  }
}