import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { KnowledgeItem } from './knowledge-item.entity';

export enum FileAssetStatus {
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PROCESSING = 'processing',
}

@Entity('file_assets')
@Index(['hash'])
export class FileAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 500 })
  storagePath: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ length: 64, unique: true })
  hash: string;

  @Column({
    type: 'enum',
    enum: FileAssetStatus,
    default: FileAssetStatus.UPLOADING,
  })
  status: FileAssetStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ length: 255, nullable: true })
  bucketName: string;

  @Column({ nullable: true })
  chunkSize: number;

  @Column({ nullable: true })
  totalChunks: number;

  @Column({ default: 0 })
  uploadedChunks: number;

  @Column({ nullable: true })
  uploadJobId: string;

  @ManyToOne(() => KnowledgeItem, knowledgeItem => knowledgeItem.fileAssets, { nullable: true })
  @JoinColumn({ name: 'knowledge_item_id' })
  knowledgeItem: KnowledgeItem;

  @Column({ name: 'knowledge_item_id', nullable: true })
  knowledgeItemId: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ length: 100, nullable: true })
  category: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}