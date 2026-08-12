import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NodeType, FileNode } from '@prisma/client';

import { CreateFolderDto } from '../dto/create-folder.dto';
import { ListFolderQueryDto } from '../dto/list-folder-query.dto';
import { FileNodeRepository } from '../repositories/file-node.repository.interface';
import { FolderStorageService } from '../storage/services/folder-storage.service';
import { buildPagination } from '../../../common/utils/pagination.util';
import { NodeAncestorResponseDto } from '../dto/node-ancestor-response.dto';
import { NodeMetadataResponseDto } from '../dto/node-metadata-response.dto';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    private readonly repository: FileNodeRepository,
    private readonly folderStorageService: FolderStorageService,
  ) {}

  async createFolder(dto: CreateFolderDto, tenantId: string, userId: string) {
    const trimmedName = dto.name.trim();

    this.logger.log(
      `Initiating folder creation: "${trimmedName}" | Parent: ${dto.parentId ?? 'root'}`,
    );

    // Validate parent
    let parent: FileNode | null = null;

    if (dto.parentId) {
      parent = await this.repository.findById(dto.parentId, tenantId);

      if (!parent) {
        this.logger.warn(`Parent folder with ID "${dto.parentId}" not found`);
        throw new NotFoundException('Parent folder not found');
      }

      if (parent.nodeType !== NodeType.FOLDER) {
        this.logger.warn(
          `Parent node "${dto.parentId}" is not a folder (type: ${parent.nodeType})`,
        );
        throw new BadRequestException('Parent must be a folder');
      }
    }

    // Duplicate validation
    const exists = await this.repository.existsByParentAndName(
      tenantId,
      dto.parentId ?? null,
      trimmedName,
    );

    if (exists) {
      this.logger.warn(
        `Folder or file named "${trimmedName}" already exists in parent "${dto.parentId ?? 'root'}"`,
      );
      throw new ConflictException(
        'A file or folder with the same name already exists',
      );
    }

    // Allocate physical storage
    this.logger.debug(`Allocating storage for folder "${trimmedName}"`);

    const storage = parent?.storageKey
      ? await this.folderStorageService.createChildFolder(
          parent.storageKey,
          trimmedName,
        )
      : await this.folderStorageService.createRootFolder(tenantId, trimmedName);

    try {
      const createdFolder = await this.repository.createFolder({
        tenantId,
        createdBy: userId,
        name: trimmedName,
        parentId: dto.parentId ?? null,
        storageProvider: storage.provider,
        storageBucket: storage.address.bucket,
        storageKey: storage.address.storageKey,
      });

      this.logger.log(
        `Successfully created folder "${trimmedName}" (ID: ${createdFolder.id}`,
      );

      return createdFolder;
    } catch (error) {
      this.logger.error(
        `Database failure during folder creation-Cleaning up allocated storage at key: ${storage.address.storageKey}`,
        error instanceof Error ? error.stack : undefined,
      );

      await this.folderStorageService.deleteFolder(
        storage.provider,
        storage.address,
      );

      throw error;
    }
  }

  async listFolderNodes(tenantId: string, query: ListFolderQueryDto) {
    this.logger.log(
      `Listing nodes | Parent: ${query.parentId ?? 'root'} | Search: ${query.search ?? 'none'} | Page: ${query.page ?? 1} | Limit: ${query.limit ?? 20}`,
    );

    if (query.parentId) {
      this.logger.debug(`Validating parent folder: ${query.parentId}`);

      const parent = await this.repository.findById(query.parentId, tenantId);

      if (!parent) {
        this.logger.warn(`Parent folder "${query.parentId}" not found.`);
        throw new NotFoundException('Parent folder not found.');
      }

      if (parent.nodeType !== NodeType.FOLDER) {
        this.logger.warn(
          `Parent node "${query.parentId}" is of type ${parent.nodeType}, expected FOLDER`,
        );
        throw new BadRequestException('Parent node must be a folder.');
      }
    }

    const { page, limit, skip, orderBy } = buildPagination(query);

    this.logger.debug(
      `Fetching nodes from repository (skip=${skip}, take=${limit})`,
    );

    const result = await this.repository.listFolderNodes({
      tenantId,
      parentId: query.parentId ?? null,
      search: query.search,
      skip,
      take: limit,
      orderBy,
    });

    this.logger.log(
      `Retrieved ${result.items.length} node(s) (total=${result.total})`,
    );

    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getNodeMetadata(
    id: string,
    tenantId: string,
  ): Promise<NodeMetadataResponseDto> {
    const node = await this.repository.findById(id, tenantId);

    if (!node) {
      this.logger.warn(`Node "${id}" not found`);
      throw new NotFoundException('Node not found.');
    }

    return NodeMetadataResponseDto.fromEntity(node);
  }

  async getNodeAncestors(
    id: string,
    tenantId: string,
  ): Promise<NodeAncestorResponseDto[]> {
    const node = await this.repository.findById(id, tenantId);

    if (!node) {
      this.logger.warn(`Node "${id}" not found for tenant: ${tenantId}`);

      throw new NotFoundException('Node not found.');
    }

    const ancestors: NodeAncestorResponseDto[] = [];
    const visited = new Set<string>();

    let currentParentId = node.parentId;

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        this.logger.error(
          `Cycle detected while resolving ancestors for node "${id}"`,
        );

        throw new BadRequestException('Invalid folder hierarchy detected.');
      }

      visited.add(currentParentId);

      const parent = await this.repository.findById(currentParentId, tenantId);

      if (!parent) {
        this.logger.warn(`Parent node "${currentParentId}" not found.`);

        throw new NotFoundException('Parent folder not found.');
      }

      ancestors.push({
        id: parent.id,
        name: parent.name,
        nodeType: parent.nodeType,
      });

      currentParentId = parent.parentId;
    }

    return ancestors.reverse();
  }
}
