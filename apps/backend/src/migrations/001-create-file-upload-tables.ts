import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateFileUploadTables1698900000001 implements MigrationInterface {
  name = 'CreateFileUploadTables1698900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create knowledge_items table
    await queryRunner.createTable(
      new Table({
        name: 'knowledge_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create upload_jobs table
    await queryRunner.createTable(
      new Table({
        name: 'upload_jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'total_size',
            type: 'bigint',
          },
          {
            name: 'uploaded_size',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'chunk_size',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'total_chunks',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'completed_chunks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'initiated', 'uploading', 'completed', 'failed', 'cancelled', 'resuming'],
            default: '"pending"',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'normal', 'high', 'urgent'],
            default: '"normal"',
          },
          {
            name: 'error_message',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'file_hash',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_chunk_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_resumable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'uploaded_chunk_hashes',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'file_asset_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'uploaded_by',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'client_ip',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create file_assets table
    await queryRunner.createTable(
      new Table({
        name: 'file_assets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'storage_path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'size',
            type: 'bigint',
          },
          {
            name: 'hash',
            type: 'varchar',
            length: '64',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['uploading', 'completed', 'failed', 'processing'],
            default: '"uploading"',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'bucket_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'chunk_size',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'total_chunks',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'uploaded_chunks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'upload_job_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'knowledge_item_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'file_assets',
      new TableIndex({
        name: 'IDX_file_assets_hash',
        columnNames: ['hash'],
      }),
    );

    await queryRunner.createIndex(
      'file_assets',
      new TableIndex({
        name: 'IDX_file_assets_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'file_assets',
      new TableIndex({
        name: 'IDX_file_assets_knowledge_item_id',
        columnNames: ['knowledge_item_id'],
      }),
    );

    await queryRunner.createIndex(
      'upload_jobs',
      new TableIndex({
        name: 'IDX_upload_jobs_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'upload_jobs',
      new TableIndex({
        name: 'IDX_upload_jobs_file_hash',
        columnNames: ['file_hash'],
      }),
    );

    await queryRunner.createIndex(
      'upload_jobs',
      new TableIndex({
        name: 'IDX_upload_jobs_file_asset_id',
        columnNames: ['file_asset_id'],
      }),
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'file_assets',
      new TableForeignKey({
        columnNames: ['knowledge_item_id'],
        referencedTableName: 'knowledge_items',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'upload_jobs',
      new TableForeignKey({
        columnNames: ['file_asset_id'],
        referencedTableName: 'file_assets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('file_assets');
    await queryRunner.dropTable('upload_jobs');
    await queryRunner.dropTable('knowledge_items');
  }
}