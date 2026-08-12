import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FileNode, NodeType } from '@prisma/client';
import { Readable } from 'stream';

import {
  ALLOWED_FILE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../../../common/constants/file.constants';
import { UploadFilesDto } from '../dto/upload-files.dto';
import {
  UploadFailureDto,
  UploadFilesResponseDto,
  UploadedFileDto,
} from '../dto/upload-file-response.dto';
import { FileNodeRepository } from '../repositories/file-node.repository.interface';
import { StorageKeyBuilder } from '../storage/builders/storage-key.builder';
import { FileStorageService } from '../storage/services/file-storage.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly repository: FileNodeRepository,
    private readonly fileStorageService: FileStorageService,
    private readonly storageKeyBuilder: StorageKeyBuilder,
  ) {}

  async uploadFiles(
    dto: UploadFilesDto,
    files: Express.Multer.File[],
    tenantId: string,
    userId: string,
  ): Promise<UploadFilesResponseDto> {
    if (!files?.length) {
      throw new BadRequestException('At least one file must be uploaded');
    }

    let parent: FileNode | null = null;

    if (dto.parentId) {
      parent = await this.repository.findById(dto.parentId, tenantId);

      if (!parent) {
        throw new NotFoundException('Parent folder not found');
      }

      if (parent.nodeType !== NodeType.FOLDER) {
        throw new BadRequestException('Parent must be a folder');
      }
    }

    const successful: UploadedFileDto[] = [];
    const failed: UploadFailureDto[] = [];

    for (const file of files) {
      try {
        const uploaded = await this.uploadSingleFile(
          file,
          parent,
          tenantId,
          userId,
        );

        successful.push(uploaded);
      } catch (error) {
        failed.push({
          fileName: file.originalname,
          reason: error instanceof Error ? error.message : 'File upload failed',
        });
      }
    }

    return {
      successful,
      failed,
    };
  }
  private async uploadSingleFile(
    file: Express.Multer.File,
    parent: FileNode | null,
    tenantId: string,
    userId: string,
  ): Promise<UploadedFileDto> {
    this.validateFile(file);

    const fileName = file.originalname.trim();

    const exists = await this.repository.existsByParentAndName(
      tenantId,
      parent?.id ?? null,
      fileName,
    );

    if (exists) {
      throw new ConflictException(
        `A file or folder with the name "${fileName}" already exists`,
      );
    }

    const storageKey = parent
      ? this.storageKeyBuilder.buildFileKey(parent.storageKey, fileName)
      : this.storageKeyBuilder.buildRootFileKey(tenantId, fileName);

    this.logger.debug(
      `Uploading file "${fileName}" to storage key "${storageKey}"`,
    );

    const storage = await this.fileStorageService.uploadFile(
      storageKey,
      Readable.from(file.buffer),
      file.size,
      file.mimetype,
    );

    try {
      const createdFile = await this.repository.createFile({
        tenantId,
        createdBy: userId,
        name: fileName,
        parentId: parent?.id ?? null,
        mimeType: file.mimetype,
        extension: this.getExtension(fileName),
        sizeBytes: BigInt(file.size),
        storageProvider: storage.provider,
        storageBucket: storage.address.bucket,
        storageKey: storage.address.storageKey,
      });

      this.logger.log(
        `Successfully uploaded file "${fileName}" (ID: ${createdFile.id})`,
      );

      return {
        id: createdFile.id,
        name: createdFile.name,
        mimeType: createdFile.mimeType,
        sizeBytes: Number(createdFile.sizeBytes),
      };
    } catch (error) {
      this.logger.error(
        `Failed to persist metadata for "${fileName}". Rolling back uploaded object.`,
        error instanceof Error ? error.stack : undefined,
      );

      await this.fileStorageService.deleteFile(
        storage.provider,
        storage.address,
      );

      throw error;
    }
  }
  private validateFile(file: Express.Multer.File): void {
    if (!file.originalname?.trim()) {
      throw new BadRequestException('File name is required');
    }

    if (file.size <= 0) {
      throw new BadRequestException(`${file.originalname} is an empty file`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `${file.originalname} exceeds the maximum allowed file size`,
      );
    }

    if (!ALLOWED_FILE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `${file.originalname} has an unsupported file type`,
      );
    }
  }

  private getExtension(fileName: string): string {
    const index = fileName.lastIndexOf('.');

    if (index === -1 || index === fileName.length - 1) {
      return '';
    }

    return fileName.substring(index + 1).toLowerCase();
  }
}
