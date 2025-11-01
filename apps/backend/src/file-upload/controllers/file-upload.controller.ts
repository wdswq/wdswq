import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Res,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileUploadService } from '../services/file-upload.service';
import { InitiateUploadDto } from '../dto/initiate-upload.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { ResumeUploadDto } from '../dto/resume-upload.dto';
import { ListFilesDto } from '../dto/list-files.dto';
import { FileAsset } from '../entities/file-asset.entity';
import { UploadJob } from '../entities/upload-job.entity';

@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a new file upload' })
  @ApiResponse({ status: 201, description: 'Upload initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initiateUpload(@Body() initiateUploadDto: InitiateUploadDto) {
    const result = await this.fileUploadService.initiateUpload(initiateUploadDto);
    return {
      success: true,
      data: result,
      message: result.existingFileAsset 
        ? 'File already exists, deduplication applied' 
        : 'Upload initiated successfully',
    };
  }

  @Post('upload-chunk')
  @ApiOperation({ summary: 'Upload a file chunk' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Chunk uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Upload job not found' })
  @UseInterceptors(
    FileInterceptor('chunk', {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max chunk size
      },
    }),
  )
  async uploadChunk(
    @Body() uploadChunkDto: UploadChunkDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file chunk provided');
    }

    const result = await this.fileUploadService.uploadChunk(uploadChunkDto, file.buffer);
    return {
      success: true,
      data: result,
      message: result.isComplete 
        ? 'File upload completed' 
        : `Chunk ${result.chunkNumber} uploaded successfully`,
    };
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume a paused or failed upload' })
  @ApiResponse({ status: 200, description: 'Upload resumed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Upload job not found' })
  async resumeUpload(@Body() resumeUploadDto: ResumeUploadDto) {
    const result = await this.fileUploadService.resumeUpload(resumeUploadDto);
    return {
      success: true,
      data: result,
      message: result.canResume 
        ? 'Upload resumed successfully' 
        : 'Upload cannot be resumed',
    };
  }

  @Post('cancel/:uploadJobId')
  @ApiOperation({ summary: 'Cancel an ongoing upload' })
  @ApiParam({ name: 'uploadJobId', description: 'Upload job ID' })
  @ApiResponse({ status: 200, description: 'Upload cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Upload job not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed upload' })
  async cancelUpload(@Param('uploadJobId', ParseUUIDPipe) uploadJobId: string) {
    await this.fileUploadService.cancelUpload(uploadJobId);
    return {
      success: true,
      message: 'Upload cancelled successfully',
    };
  }

  @Get('jobs/:uploadJobId')
  @ApiOperation({ summary: 'Get upload job details' })
  @ApiParam({ name: 'uploadJobId', description: 'Upload job ID' })
  @ApiResponse({ status: 200, description: 'Upload job details retrieved' })
  @ApiResponse({ status: 404, description: 'Upload job not found' })
  async getUploadJob(@Param('uploadJobId', ParseUUIDPipe) uploadJobId: string) {
    const uploadJob = await this.fileUploadService.getUploadJob(uploadJobId);
    return {
      success: true,
      data: uploadJob,
    };
  }

  @Get('files')
  @ApiOperation({ summary: 'List files with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by filename' })
  @ApiQuery({ name: 'mimeType', required: false, description: 'Filter by MIME type' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'knowledgeItemId', required: false, description: 'Filter by knowledge item ID' })
  @ApiQuery({ name: 'minSize', required: false, description: 'Minimum file size' })
  @ApiQuery({ name: 'maxSize', required: false, description: 'Maximum file size' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async listFiles(@Query() listFilesDto: ListFilesDto) {
    // Handle comma-separated tags
    if (listFilesDto.tags && typeof listFilesDto.tags === 'string') {
      listFilesDto.tags = (listFilesDto.tags as string).split(',').map(tag => tag.trim());
    }

    const result = await this.fileUploadService.listFiles(listFilesDto);
    return {
      success: true,
      data: result,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get('files/:id')
  @ApiOperation({ summary: 'Get file asset details' })
  @ApiParam({ name: 'id', description: 'File asset ID' })
  @ApiResponse({ status: 200, description: 'File asset details retrieved' })
  @ApiResponse({ status: 404, description: 'File asset not found' })
  async getFile(@Param('id', ParseUUIDPipe) id: string) {
    const fileAsset = await this.fileUploadService.getFileAsset(id);
    return {
      success: true,
      data: fileAsset,
    };
  }

  @Get('files/:id/download')
  @ApiOperation({ summary: 'Get file download URL' })
  @ApiParam({ name: 'id', description: 'File asset ID' })
  @ApiQuery({ name: 'expiry', required: false, description: 'URL expiry time in seconds', type: Number })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  @ApiResponse({ status: 404, description: 'File asset not found' })
  @ApiResponse({ status: 400, description: 'File not ready for download' })
  async getFileDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('expiry') expiry?: number,
  ) {
    const downloadUrl = await this.fileUploadService.getFileDownloadUrl(id, expiry);
    return {
      success: true,
      data: { downloadUrl },
      message: 'Download URL generated successfully',
    };
  }

  @Get('files/:id/stream')
  @ApiOperation({ summary: 'Stream file content' })
  @ApiParam({ name: 'id', description: 'File asset ID' })
  @ApiResponse({ status: 200, description: 'File streaming' })
  @ApiResponse({ status: 404, description: 'File asset not found' })
  async streamFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    try {
      const fileAsset = await this.fileUploadService.getFileAsset(id);
      
      if (fileAsset.status !== 'completed') {
        throw new BadRequestException('File is not ready for streaming');
      }

      // Set appropriate headers
      res.setHeader('Content-Type', fileAsset.mimeType);
      res.setHeader('Content-Length', fileAsset.size);
      res.setHeader('Content-Disposition', `inline; filename="${fileAsset.originalName}"`);
      
      // Stream the file from MinIO
      // Note: This would require extending MinioService to provide streaming capability
      // For now, we'll redirect to the download URL
      const downloadUrl = await this.fileUploadService.getFileDownloadUrl(id);
      
      return res.redirect(HttpStatus.TEMPORARY_REDIRECT, downloadUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'File not found',
        });
      }
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Delete a file asset' })
  @ApiParam({ name: 'id', description: 'File asset ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File asset not found' })
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    await this.fileUploadService.deleteFileAsset(id);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}