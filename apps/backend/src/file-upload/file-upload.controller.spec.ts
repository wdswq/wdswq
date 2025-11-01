import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { FileUploadController } from './controllers/file-upload.controller';
import { FileUploadService } from './services/file-upload.service';
import { MinioService } from './services/minio.service';
import { FileValidationService } from './services/file-validation.service';
import { InitiateUploadDto } from './dto/initiate-upload.dto';
import { UploadChunkDto } from './dto/upload-chunk.dto';
import { ResumeUploadDto } from './dto/resume-upload.dto';
import { ListFilesDto } from './dto/list-files.dto';
import { FileAsset, FileAssetStatus } from './entities/file-asset.entity';
import { UploadJob, UploadJobStatus } from './entities/upload-job.entity';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let service: FileUploadService;

  const mockFileUploadService = {
    initiateUpload: jest.fn(),
    uploadChunk: jest.fn(),
    resumeUpload: jest.fn(),
    cancelUpload: jest.fn(),
    getUploadJob: jest.fn(),
    listFiles: jest.fn(),
    getFileAsset: jest.fn(),
    getFileDownloadUrl: jest.fn(),
    deleteFileAsset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        MinioService,
        FileValidationService,
      ],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initiateUpload', () => {
    it('should initiate upload successfully', async () => {
      const initiateUploadDto: InitiateUploadDto = {
        fileName: 'test.pdf',
        totalSize: 1024,
        mimeType: 'application/pdf',
        category: 'document' as any,
      };

      const expectedResult = {
        uploadJobId: 'uuid',
        chunkSize: 1024,
        totalChunks: 1,
      };

      mockFileUploadService.initiateUpload.mockResolvedValue(expectedResult);

      const result = await controller.initiateUpload(initiateUploadDto);

      expect(service.initiateUpload).toHaveBeenCalledWith(initiateUploadDto);
      expect(result).toEqual({
        success: true,
        data: expectedResult,
        message: 'Upload initiated successfully',
      });
    });

    it('should handle deduplication scenario', async () => {
      const initiateUploadDto: InitiateUploadDto = {
        fileName: 'test.pdf',
        totalSize: 1024,
        fileHash: 'existing-hash',
      };

      const mockFileAsset = new FileAsset();
      mockFileAsset.id = 'file-uuid';

      const expectedResult = {
        uploadJobId: 'uuid',
        chunkSize: 1024,
        totalChunks: 1,
        existingFileAsset: mockFileAsset,
      };

      mockFileUploadService.initiateUpload.mockResolvedValue(expectedResult);

      const result = await controller.initiateUpload(initiateUploadDto);

      expect(result.message).toBe('File already exists, deduplication applied');
    });
  });

  describe('uploadChunk', () => {
    it('should upload chunk successfully', async () => {
      const uploadChunkDto: UploadChunkDto = {
        uploadJobId: 'uuid',
        chunkNumber: 0,
      };

      const mockFile = {
        buffer: Buffer.from('test chunk data'),
      } as Express.Multer.File;

      const expectedResult = {
        success: true,
        chunkNumber: 0,
        isComplete: false,
        uploadJobStatus: UploadJobStatus.UPLOADING,
      };

      mockFileUploadService.uploadChunk.mockResolvedValue(expectedResult);

      const result = await controller.uploadChunk(uploadChunkDto, mockFile);

      expect(service.uploadChunk).toHaveBeenCalledWith(uploadChunkDto, mockFile.buffer);
      expect(result.data).toEqual(expectedResult);
    });

    it('should handle last chunk scenario', async () => {
      const uploadChunkDto: UploadChunkDto = {
        uploadJobId: 'uuid',
        chunkNumber: 0,
        isLastChunk: true,
      };

      const mockFile = {
        buffer: Buffer.from('test chunk data'),
      } as Express.Multer.File;

      const expectedResult = {
        success: true,
        chunkNumber: 0,
        isComplete: true,
        uploadJobStatus: UploadJobStatus.COMPLETED,
      };

      mockFileUploadService.uploadChunk.mockResolvedValue(expectedResult);

      const result = await controller.uploadChunk(uploadChunkDto, mockFile);

      expect(result.message).toBe('File upload completed');
    });

    it('should throw error when no file provided', async () => {
      const uploadChunkDto: UploadChunkDto = {
        uploadJobId: 'uuid',
        chunkNumber: 0,
      };

      await expect(controller.uploadChunk(uploadChunkDto, null)).rejects.toThrow();
    });
  });

  describe('resumeUpload', () => {
    it('should resume upload successfully', async () => {
      const resumeUploadDto: ResumeUploadDto = {
        uploadJobId: 'uuid',
        fileHash: 'test-hash',
      };

      const mockUploadJob = new UploadJob();
      mockUploadJob.id = 'uuid';

      const expectedResult = {
        uploadJob: mockUploadJob,
        completedChunks: [0, 1],
        canResume: true,
      };

      mockFileUploadService.resumeUpload.mockResolvedValue(expectedResult);

      const result = await controller.resumeUpload(resumeUploadDto);

      expect(service.resumeUpload).toHaveBeenCalledWith(resumeUploadDto);
      expect(result.data).toEqual(expectedResult);
      expect(result.message).toBe('Upload resumed successfully');
    });
  });

  describe('cancelUpload', () => {
    it('should cancel upload successfully', async () => {
      const uploadJobId = 'uuid';

      mockFileUploadService.cancelUpload.mockResolvedValue(undefined);

      const result = await controller.cancelUpload(uploadJobId);

      expect(service.cancelUpload).toHaveBeenCalledWith(uploadJobId);
      expect(result).toEqual({
        success: true,
        message: 'Upload cancelled successfully',
      });
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

      const expectedResult = {
        files: [mockFileAsset],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockFileUploadService.listFiles.mockResolvedValue(expectedResult);

      const result = await controller.listFiles(listFilesDto);

      expect(service.listFiles).toHaveBeenCalledWith(listFilesDto);
      expect(result.data).toEqual(expectedResult);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should handle comma-separated tags', async () => {
      const listFilesDto = {
        page: 1,
        limit: 10,
        tags: 'tag1,tag2,tag3',
      } as any;

      mockFileUploadService.listFiles.mockResolvedValue({
        files: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.listFiles(listFilesDto);

      expect(service.listFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'],
        })
      );
    });
  });

  describe('getFile', () => {
    it('should get file asset successfully', async () => {
      const fileId = 'uuid';
      const mockFileAsset = new FileAsset();
      mockFileAsset.id = fileId;

      mockFileUploadService.getFileAsset.mockResolvedValue(mockFileAsset);

      const result = await controller.getFile(fileId);

      expect(service.getFileAsset).toHaveBeenCalledWith(fileId);
      expect(result.data).toEqual(mockFileAsset);
    });
  });

  describe('getFileDownloadUrl', () => {
    it('should generate download URL successfully', async () => {
      const fileId = 'uuid';
      const downloadUrl = 'https://minio.example.com/bucket/file?presigned=true';

      mockFileUploadService.getFileDownloadUrl.mockResolvedValue(downloadUrl);

      const result = await controller.getFileDownloadUrl(fileId);

      expect(service.getFileDownloadUrl).toHaveBeenCalledWith(fileId, undefined);
      expect(result.data.downloadUrl).toBe(downloadUrl);
    });

    it('should pass expiry parameter', async () => {
      const fileId = 'uuid';
      const expiry = 7200;
      const downloadUrl = 'https://minio.example.com/bucket/file?presigned=true';

      mockFileUploadService.getFileDownloadUrl.mockResolvedValue(downloadUrl);

      await controller.getFileDownloadUrl(fileId, expiry);

      expect(service.getFileDownloadUrl).toHaveBeenCalledWith(fileId, expiry);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const fileId = 'uuid';

      mockFileUploadService.deleteFileAsset.mockResolvedValue(undefined);

      const result = await controller.deleteFile(fileId);

      expect(service.deleteFileAsset).toHaveBeenCalledWith(fileId);
      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully',
      });
    });
  });

  describe('getUploadJob', () => {
    it('should get upload job successfully', async () => {
      const uploadJobId = 'uuid';
      const mockUploadJob = new UploadJob();
      mockUploadJob.id = uploadJobId;

      mockFileUploadService.getUploadJob.mockResolvedValue(mockUploadJob);

      const result = await controller.getUploadJob(uploadJobId);

      expect(service.getUploadJob).toHaveBeenCalledWith(uploadJobId);
      expect(result.data).toEqual(mockUploadJob);
    });
  });
});