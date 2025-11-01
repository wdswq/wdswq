import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { Repository, DataSource } from 'typeorm';
import { MinioService } from './minio.service';
import { FileValidationService } from './file-validation.service';
import { FileAsset } from '../entities/file-asset.entity';
import { UploadJob } from '../entities/upload-job.entity';
import { KnowledgeItem } from '../entities/knowledge-item.entity';
import { InitiateUploadDto, FileCategory } from '../dto/initiate-upload.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { ResumeUploadDto } from '../dto/resume-upload.dto';
import { ListFilesDto } from '../dto/list-files.dto';
import { FileAssetStatus } from '../entities/file-asset.entity';
import { UploadJobStatus } from '../entities/upload-job.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let fileAssetRepository: Repository<FileAsset>;
  let uploadJobRepository: Repository<UploadJob>;
  let knowledgeItemRepository: Repository<KnowledgeItem>;
  let minioService: MinioService;
  let fileValidationService: FileValidationService;
  let dataSource: DataSource;

  const mockFileAssetRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUploadJobRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockKnowledgeItemRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockMinioService = {
    uploadFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
    fileExists: jest.fn(),
    generatePresignedUrl: jest.fn(),
    getBucketName: jest.fn(),
    listFiles: jest.fn(),
  };

  const mockFileValidationService = {
    validateFile: jest.fn(),
    calculateFileHash: jest.fn(),
    calculateChunkHash: jest.fn(),
    getMaxFileSize: jest.fn(),
    generateStoragePath: jest.fn(),
    sanitizeFileName: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        FileUploadService,
        {
          provide: getRepositoryToken(FileAsset),
          useValue: mockFileAssetRepository,
        },
        {
          provide: getRepositoryToken(UploadJob),
          useValue: mockUploadJobRepository,
        },
        {
          provide: getRepositoryToken(KnowledgeItem),
          useValue: mockKnowledgeItemRepository,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
        {
          provide: FileValidationService,
          useValue: mockFileValidationService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    fileAssetRepository = module.get<Repository<FileAsset>>(getRepositoryToken(FileAsset));
    uploadJobRepository = module.get<Repository<UploadJob>>(getRepositoryToken(UploadJob));
    knowledgeItemRepository = module.get<Repository<KnowledgeItem>>(getRepositoryToken(KnowledgeItem));
    minioService = module.get<MinioService>(MinioService);
    fileValidationService = module.get<FileValidationService>(FileValidationService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateUpload', () => {
    it('should initiate upload successfully', async () => {
      const initiateUploadDto: InitiateUploadDto = {
        fileName: 'test.pdf',
        totalSize: 1024,
        mimeType: 'application/pdf',
        chunkSize: 512,
        category: FileCategory.DOCUMENT,
      };

      const mockUploadJob = new UploadJob();
      mockUploadJob.id = 'upload-job-uuid';
      mockUploadJob.fileName = initiateUploadDto.fileName;
      mockUploadJob.totalSize = initiateUploadDto.totalSize;
      mockUploadJob.chunkSize = initiateUploadDto.chunkSize;
      mockUploadJob.totalChunks = 2;
      mockUploadJob.status = UploadJobStatus.INITIATED;

      mockUploadJobRepository.create.mockReturnValue(mockUploadJob);
      mockUploadJobRepository.save.mockResolvedValue(mockUploadJob);

      const result = await service.initiateUpload(initiateUploadDto);

      expect(result).toEqual({
        uploadJobId: mockUploadJob.id,
        chunkSize: initiateUploadDto.chunkSize,
        totalChunks: 2,
        existingFileAsset: undefined,
      });

      expect(mockUploadJobRepository.create).toHaveBeenCalled();
      expect(mockUploadJobRepository.save).toHaveBeenCalled();
    });

    it('should handle file size validation error', async () => {
      const initiateUploadDto: InitiateUploadDto = {
        fileName: 'test.pdf',
        totalSize: 1024,
      };

      mockFileValidationService.getMaxFileSize.mockReturnValue(512);

      await expect(service.initiateUpload(initiateUploadDto)).rejects.toThrow(
        'File size exceeds maximum allowed size of 512 bytes'
      );
    });

    it('should handle existing file deduplication', async () => {
      const initiateUploadDto: InitiateUploadDto = {
        fileName: 'test.pdf',
        totalSize: 1024,
        fileHash: 'existing-hash',
      };

      const mockExistingFile = new FileAsset();
      mockExistingFile.id = 'existing-file-uuid';
      mockExistingFile.hash = 'existing-hash';
      mockExistingFile.status = FileAssetStatus.COMPLETED;

      const mockUploadJob = new UploadJob();
      mockUploadJob.id = 'upload-job-uuid';
      mockUploadJob.status = UploadJobStatus.COMPLETED;
      mockUploadJob.fileAssetId = mockExistingFile.id;

      mockFileAssetRepository.findOne.mockResolvedValue(mockExistingFile);
      mockUploadJobRepository.create.mockReturnValue(mockUploadJob);
      mockUploadJobRepository.save.mockResolvedValue(mockUploadJob);

      const result = await service.initiateUpload(initiateUploadDto);

      expect(result.existingFileAsset).toEqual(mockExistingFile);
      expect(mockUploadJob.status).toBe(UploadJobStatus.COMPLETED);
    });
  });

  describe('getFileAsset', () => {
    it('should get file asset successfully', async () => {
      const fileId = 'file-uuid';
      const mockFileAsset = new FileAsset();
      mockFileAsset.id = fileId;

      mockFileAssetRepository.findOne.mockResolvedValue(mockFileAsset);

      const result = await service.getFileAsset(fileId);

      expect(result).toEqual(mockFileAsset);
      expect(mockFileAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: fileId },
        relations: ['knowledgeItem'],
      });
    });

    it('should throw error when file asset not found', async () => {
      const fileId = 'non-existent-uuid';

      mockFileAssetRepository.findOne.mockResolvedValue(null);

      await expect(service.getFileAsset(fileId)).rejects.toThrow('File asset not found');
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const listFilesDto: ListFilesDto = {
        page: 1,
        limit: 10,
      };

      const mockFileAsset = new FileAsset();
      mockFileAsset.id = 'file-uuid';

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockFileAsset], 1]),
      };

      mockFileAssetRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listFiles(listFilesDto);

      expect(result).toEqual({
        files: [mockFileAsset],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('deleteFileAsset', () => {
    it('should delete file asset successfully', async () => {
      const fileId = 'file-uuid';
      const mockFileAsset = new FileAsset();
      mockFileAsset.id = fileId;
      mockFileAsset.storagePath = 'test/file.pdf';

      mockFileAssetRepository.findOne.mockResolvedValue(mockFileAsset);
      mockMinioService.deleteFile.mockResolvedValue(undefined);
      mockFileAssetRepository.remove.mockResolvedValue(mockFileAsset);

      await service.deleteFileAsset(fileId);

      expect(mockMinioService.deleteFile).toHaveBeenCalledWith(mockFileAsset.storagePath);
      expect(mockFileAssetRepository.remove).toHaveBeenCalledWith(mockFileAsset);
    });
  });

  describe('getUploadJob', () => {
    it('should get upload job successfully', async () => {
      const uploadJobId = 'upload-job-uuid';
      const mockUploadJob = new UploadJob();
      mockUploadJob.id = uploadJobId;

      mockUploadJobRepository.findOne.mockResolvedValue(mockUploadJob);

      const result = await service.getUploadJob(uploadJobId);

      expect(result).toEqual(mockUploadJob);
      expect(mockUploadJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: uploadJobId },
        relations: ['fileAsset'],
      });
    });

    it('should throw error when upload job not found', async () => {
      const uploadJobId = 'non-existent-uuid';

      mockUploadJobRepository.findOne.mockResolvedValue(null);

      await expect(service.getUploadJob(uploadJobId)).rejects.toThrow('Upload job not found');
    });
  });
});