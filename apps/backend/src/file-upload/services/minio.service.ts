import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'uploads');
    this.initializeClient();
  }

  private initializeClient() {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    const useSSL = this.configService.get<boolean>('MINIO_USE_SSL', false);

    this.client = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`);
    }
  }

  async uploadFile(objectName: string, buffer: Buffer): Promise<string> {
    try {
      await this.client.putObject(this.bucketName, objectName, buffer);
      this.logger.log(`File uploaded: ${objectName}`);
      return objectName;
    } catch (error) {
      this.logger.error(`Error uploading file ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async uploadStream(objectName: string, stream: NodeJS.ReadableStream, size: number): Promise<string> {
    try {
      // Convert ReadableStream to Readable for MinIO compatibility
      const { Readable } = require('stream');
      const readableStream = Readable.from(stream);
      await this.client.putObject(this.bucketName, objectName, readableStream, size);
      this.logger.log(`Stream uploaded: ${objectName}`);
      return objectName;
    } catch (error) {
      this.logger.error(`Error uploading stream ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async getFile(objectName: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(this.bucketName, objectName);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Error getting file ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async getFileStream(objectName: string): Promise<NodeJS.ReadableStream> {
    try {
      return await this.client.getObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(`Error getting file stream ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted: ${objectName}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async getFileStats(objectName: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.client.statObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(`Error getting file stats ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async listFiles(prefix?: string): Promise<Minio.BucketItem[]> {
    try {
      const stream = this.client.listObjects(this.bucketName, prefix, true);
      const files: Minio.BucketItem[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => files.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(files));
      });
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`);
      throw error;
    }
  }

  async generatePresignedUrl(objectName: string, expiry: number = 3600): Promise<string> {
    try {
      return await this.client.presignedGetObject(this.bucketName, objectName, expiry);
    } catch (error) {
      this.logger.error(`Error generating presigned URL for ${objectName}: ${error.message}`);
      throw error;
    }
  }

  getBucketName(): string {
    return this.bucketName;
  }
}