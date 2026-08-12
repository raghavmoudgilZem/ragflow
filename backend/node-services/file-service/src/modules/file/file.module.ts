import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { FolderService } from './services/folder.service';
import { PrismaFileNodeRepository } from './repositories/prisma-file-node.repository';
import { FileNodeRepository } from './repositories/file-node.repository.interface';
import { FoldersController } from './controllers/folders.controller';
import { StorageConfig } from './storage/storage.config';
import { FolderStorageService } from './storage/services/folder-storage.service';
import { StorageKeyBuilder } from './storage/builders/storage-key.builder';
import { LocalStorageProvider } from './storage/providers/local-storage.provider';
import { MinioStorageProvider } from './storage/providers/minio-storage.provider';
import { S3StorageProvider } from './storage/providers/s3-storage.provider';
import { StorageProviderRegistry } from './storage/registry/storage-provider.registry';
import { NodesController } from './controllers/nodes.controller';
import { FilesController } from './controllers/files.controller';
import { FileService } from './services/file.service';
import { FileStorageService } from './storage/services/file-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [FoldersController, NodesController, FilesController],
  providers: [
    FolderService,
    PrismaFileNodeRepository,
    StorageConfig,
    StorageKeyBuilder,
    LocalStorageProvider,
    MinioStorageProvider,
    S3StorageProvider,
    StorageProviderRegistry,
    FolderStorageService,
    FileService,
    FileStorageService,
    {
      provide: FileNodeRepository,
      useExisting: PrismaFileNodeRepository,
    },
  ],
  exports: [FolderService, FileService],
})
export class FileModule {}
