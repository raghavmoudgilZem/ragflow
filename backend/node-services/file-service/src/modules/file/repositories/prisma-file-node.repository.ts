import { Injectable } from '@nestjs/common';
import { FileNode, NodeType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateFolderInput,
  FileNodeRepository,
  ListFolderNodesInput,
  ListFolderNodesResult,
  CreateFileInput,
} from './file-node.repository.interface';

@Injectable()
export class PrismaFileNodeRepository implements FileNodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFolder(input: CreateFolderInput): Promise<FileNode> {
    return this.prisma.fileNode.create({
      data: {
        tenantId: input.tenantId,
        createdBy: input.createdBy,
        name: input.name,
        parentId: input.parentId ?? null,
        nodeType: NodeType.FOLDER,
        storageProvider: input.storageProvider,
        storageBucket: input.storageBucket,
        storageKey: input.storageKey,
      },
    });
  }

  async findById(id: string, tenantId: string): Promise<FileNode | null> {
    return this.prisma.fileNode.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async existsByParentAndName(
    tenantId: string,
    parentId: string | null,
    name: string,
  ): Promise<boolean> {
    const count = await this.prisma.fileNode.count({
      where: {
        tenantId,
        parentId,
        name,
      },
    });

    return count > 0;
  }

  async listFolderNodes(
    input: ListFolderNodesInput,
  ): Promise<ListFolderNodesResult> {
    const where: Prisma.FileNodeWhereInput = {
      tenantId: input.tenantId,
      parentId: input.parentId,
    };

    if (input.search?.trim()) {
      where.name = {
        contains: input.search.trim(),
        mode: 'insensitive',
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.fileNode.findMany({
        where,
        orderBy: input.orderBy,
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.fileNode.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  }

  async createFile(input: CreateFileInput): Promise<FileNode> {
    return this.prisma.fileNode.create({
      data: {
        tenantId: input.tenantId,
        createdBy: input.createdBy,
        nodeType: NodeType.FILE,
        name: input.name,
        parentId: input.parentId,
        mimeType: input.mimeType,
        extension: input.extension,
        sizeBytes: input.sizeBytes,
        storageProvider: input.storageProvider,
        storageBucket: input.storageBucket,
        storageKey: input.storageKey,
      },
    });
  }
}
