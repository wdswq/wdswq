import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { FileAsset } from './file-asset.entity';

export enum UploadJobStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RESUMING = 'resuming',
}

export enum UploadJobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('upload_jobs')
export class UploadJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  fileName: string;

  @Column({ type: 'bigint' })
  totalSize: number;

  @Column({ type: 'bigint', nullable: true })
  uploadedSize: number;

  @Column({ nullable: true })
  chunkSize: number;

  @Column({ nullable: true })
  totalChunks: number;

  @Column({ default: 0 })
  completedChunks: number;

  @Column({
    type: 'enum',
    enum: UploadJobStatus,
    default: UploadJobStatus.PENDING,
  })
  status: UploadJobStatus;

  @Column({
    type: 'enum',
    enum: UploadJobPriority,
    default: UploadJobPriority.NORMAL,
  })
  priority: UploadJobPriority;

  @Column({ length: 500, nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ length: 64, nullable: true })
  fileHash: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastChunkAt: Date;

  @Column({ default: false })
  isResumable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  uploadedChunkHashes: string[];

  @OneToOne(() => FileAsset, fileAsset => fileAsset.uploadJobId, { nullable: true })
  @JoinColumn({ name: 'file_asset_id' })
  fileAsset: FileAsset;

  @Column({ name: 'file_asset_id', nullable: true })
  fileAssetId: string;

  @Column({ length: 100, nullable: true })
  uploadedBy: string;

  @Column({ length: 50, nullable: true })
  clientIp: string;

  @Column({ length: 100, nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}