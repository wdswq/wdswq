import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileCategory } from '../dto/initiate-upload.dto';
import { fileTypeFromBuffer } from 'file-type';
import * as crypto from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: Set<string>;
  private readonly categoryMimeTypes: Map<FileCategory, string[]>;

  constructor(private configService: ConfigService) {
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 100 * 1024 * 1024); // 100MB default
    const allowedTypes = this.configService.get<string>('ALLOWED_FILE_TYPES', '');
    this.allowedMimeTypes = new Set(allowedTypes.split(',').map(type => type.trim()).filter(Boolean));
    
    this.categoryMimeTypes = new Map([
      [FileCategory.DOCUMENT, [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/rtf',
      ]],
      [FileCategory.AUDIO, [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/aac',
        'audio/flac',
        'audio/webm',
      ]],
      [FileCategory.VIDEO, [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-matroska',
      ]],
      [FileCategory.IMAGE, [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
      ]],
      [FileCategory.ARCHIVE, [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
      ]],
    ]);
  }

  async validateFile(buffer: Buffer, originalName: string, category?: FileCategory): Promise<{
    isValid: boolean;
    mimeType: string;
    detectedCategory: FileCategory;
    error?: string;
  }> {
    try {
      // Check file size
      if (buffer.length > this.maxFileSize) {
        return {
          isValid: false,
          mimeType: '',
          detectedCategory: FileCategory.OTHER,
          error: `File size exceeds maximum allowed size of ${this.formatBytes(this.maxFileSize)}`,
        };
      }

      // Detect file type from buffer
      const fileType = await fileTypeFromBuffer(buffer);
      const detectedMimeType = fileType?.mime || mime.lookup(originalName) || 'application/octet-stream';
      
      // Validate MIME type
      if (this.allowedMimeTypes.size > 0 && !this.allowedMimeTypes.has(detectedMimeType)) {
        return {
          isValid: false,
          mimeType: detectedMimeType,
          detectedCategory: FileCategory.OTHER,
          error: `File type ${detectedMimeType} is not allowed`,
        };
      }

      // Detect category
      const detectedCategory = this.detectCategory(detectedMimeType);

      // Validate category if provided
      if (category && !this.isMimeTypeInCategory(detectedMimeType, category)) {
        return {
          isValid: false,
          mimeType: detectedMimeType,
          detectedCategory,
          error: `File type ${detectedMimeType} does not match category ${category}`,
        };
      }

      return {
        isValid: true,
        mimeType: detectedMimeType,
        detectedCategory,
      };
    } catch (error) {
      this.logger.error(`Error validating file: ${error.message}`);
      return {
        isValid: false,
        mimeType: '',
        detectedCategory: FileCategory.OTHER,
        error: 'Failed to validate file',
      };
    }
  }

  private detectCategory(mimeType: string): FileCategory {
    for (const [category, mimeTypes] of this.categoryMimeTypes) {
      if (mimeTypes.includes(mimeType)) {
        return category;
      }
    }
    return FileCategory.OTHER;
  }

  private isMimeTypeInCategory(mimeType: string, category: FileCategory): boolean {
    const mimeTypes = this.categoryMimeTypes.get(category);
    return mimeTypes?.includes(mimeType) || false;
  }

  async calculateFileHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async calculateChunkHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  getAllowedMimeTypes(): string[] {
    return Array.from(this.allowedMimeTypes);
  }

  getCategoryMimeTypes(category: FileCategory): string[] {
    return this.categoryMimeTypes.get(category) || [];
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isAllowedMimeType(mimeType: string): boolean {
    return this.allowedMimeTypes.size === 0 || this.allowedMimeTypes.has(mimeType);
  }

  sanitizeFileName(fileName: string): string {
    // Remove or replace dangerous characters
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  generateStoragePath(originalName: string, hash: string, category?: FileCategory): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const sanitized = this.sanitizeFileName(originalName);
    const extension = sanitized.includes('.') ? sanitized.substring(sanitized.lastIndexOf('.')) : '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.')) || sanitized;
    
    const prefix = category || 'general';
    return `${prefix}/${year}/${month}/${day}/${hash.substring(0, 2)}/${hash.substring(2, 4)}/${hash}-${nameWithoutExt}${extension}`;
  }
}