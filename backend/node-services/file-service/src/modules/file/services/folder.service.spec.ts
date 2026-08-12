import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FileNode, NodeType, StorageProvider } from '@prisma/client';

import { FolderService } from './folder.service';
import { FolderStorageService } from '../storage/services/folder-storage.service';
import { FileNodeRepository } from '../repositories/file-node.repository.interface';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { ListFolderQueryDto } from '../dto/list-folder-query.dto';

describe('FolderService', () => {
  let service: FolderService;

  let repository: jest.Mocked<FileNodeRepository>;
  let folderStorageService: jest.Mocked<FolderStorageService>;

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(async () => {
    repository = {
      createFolder: jest.fn(),
      createFile: jest.fn(),
      findById: jest.fn(),
      existsByParentAndName: jest.fn(),
      listFolderNodes: jest.fn(),
    };

    folderStorageService = {
      createRootFolder: jest.fn(),
      createChildFolder: jest.fn(),
      deleteFolder: jest.fn(),
    } as unknown as jest.Mocked<FolderStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolderService,
        {
          provide: FileNodeRepository,
          useValue: repository,
        },
        {
          provide: FolderStorageService,
          useValue: folderStorageService,
        },
      ],
    }).compile();

    service = module.get(FolderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFolder', () => {
    it('should create a root folder', async () => {
      const dto: CreateFolderDto = {
        name: 'documents',
      };

      const storage = {
        provider: StorageProvider.LOCAL,
        address: {
          bucket: '',
          storageKey: 'tenant-1/documents/',
        },
      };

      const folder = {
        id: 'folder-1',
        tenantId,
        createdBy: userId,
        name: 'documents',
        parentId: null,
        nodeType: NodeType.FOLDER,
        storageProvider: StorageProvider.LOCAL,
        storageBucket: '',
        storageKey: 'tenant-1/documents/',
      } as FileNode;

      repository.existsByParentAndName.mockResolvedValue(false);
      folderStorageService.createRootFolder.mockResolvedValue(storage);
      repository.createFolder.mockResolvedValue(folder);

      const result = await service.createFolder(dto, tenantId, userId);

      expect(folderStorageService.createRootFolder).toHaveBeenCalledWith(
        tenantId,
        'documents',
      );

      expect(folderStorageService.createChildFolder).not.toHaveBeenCalled();

      expect(repository.createFolder).toHaveBeenCalledWith({
        tenantId,
        createdBy: userId,
        name: 'documents',
        parentId: null,
        storageProvider: StorageProvider.LOCAL,
        storageBucket: '',
        storageKey: 'tenant-1/documents/',
      });

      expect(result).toBe(folder);
    });

    it('should create a nested folder', async () => {
      const dto: CreateFolderDto = {
        name: 'child',
        parentId: 'parent-id',
      };

      const parent = {
        id: 'parent-id',
        nodeType: NodeType.FOLDER,
        storageKey: 'tenant-1/parent/',
      } as FileNode;

      const storage = {
        provider: StorageProvider.LOCAL,
        address: {
          bucket: '',
          storageKey: 'tenant-1/parent/child/',
        },
      };

      const folder = {
        id: 'child-id',
        name: 'child',
        parentId: 'parent-id',
        nodeType: NodeType.FOLDER,
        storageKey: 'tenant-1/parent/child/',
      } as FileNode;

      repository.findById.mockResolvedValue(parent);
      repository.existsByParentAndName.mockResolvedValue(false);
      folderStorageService.createChildFolder.mockResolvedValue(storage);
      repository.createFolder.mockResolvedValue(folder);

      const result = await service.createFolder(dto, tenantId, userId);

      expect(repository.findById).toHaveBeenCalledWith('parent-id', tenantId);

      expect(folderStorageService.createChildFolder).toHaveBeenCalledWith(
        'tenant-1/parent/',
        'child',
      );

      expect(folderStorageService.createRootFolder).not.toHaveBeenCalled();

      expect(result).toBe(folder);
    });

    it('should throw NotFoundException when parent does not exist', async () => {
      const dto: CreateFolderDto = {
        name: 'child',
        parentId: 'missing-parent',
      };

      repository.findById.mockResolvedValue(null);

      await expect(service.createFolder(dto, tenantId, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.createFolder).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when parent is a file', async () => {
      const dto: CreateFolderDto = {
        name: 'child',
        parentId: 'file-id',
      };

      repository.findById.mockResolvedValue({
        id: 'file-id',
        nodeType: NodeType.FILE,
      } as FileNode);

      await expect(service.createFolder(dto, tenantId, userId)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.createFolder).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when duplicate folder exists', async () => {
      const dto: CreateFolderDto = {
        name: 'documents',
      };

      repository.existsByParentAndName.mockResolvedValue(true);

      await expect(service.createFolder(dto, tenantId, userId)).rejects.toThrow(
        ConflictException,
      );

      expect(repository.createFolder).not.toHaveBeenCalled();
    });

    it('should cleanup storage when repository createFolder fails', async () => {
      const dto: CreateFolderDto = {
        name: 'documents',
      };

      const storage = {
        provider: StorageProvider.LOCAL,
        address: {
          bucket: '',
          storageKey: 'tenant-1/documents/',
        },
      };

      repository.existsByParentAndName.mockResolvedValue(false);
      folderStorageService.createRootFolder.mockResolvedValue(storage);

      repository.createFolder.mockRejectedValue(new Error('Database error'));

      await expect(service.createFolder(dto, tenantId, userId)).rejects.toThrow(
        'Database error',
      );

      expect(folderStorageService.deleteFolder).toHaveBeenCalledWith(
        StorageProvider.LOCAL,
        storage.address,
      );
    });
  });

  describe('listFolderNodes', () => {
    it('should list root folders', async () => {
      const items = [
        {
          id: '1',
          name: 'Docs',
          nodeType: NodeType.FOLDER,
        } as FileNode,
      ];

      repository.listFolderNodes.mockResolvedValue({
        items,
        total: 1,
      });

      const query = new ListFolderQueryDto();

      const result = await service.listFolderNodes(tenantId, query);

      expect(repository.listFolderNodes).toHaveBeenCalledWith({
        tenantId,
        parentId: null,
        search: undefined,
        skip: 0,
        take: 20,
        orderBy: {
          name: 'asc',
        },
      });

      expect(result.items).toEqual(items);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should throw NotFoundException when parent folder does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      const query = new ListFolderQueryDto();
      query.parentId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(service.listFolderNodes(tenantId, query)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.listFolderNodes).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when parent is a file', async () => {
      repository.findById.mockResolvedValue({
        id: 'file-id',
        nodeType: NodeType.FILE,
      } as FileNode);

      const query = new ListFolderQueryDto();
      query.parentId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(service.listFolderNodes(tenantId, query)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.listFolderNodes).not.toHaveBeenCalled();
    });

    it('should list child folders', async () => {
      repository.findById.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        nodeType: NodeType.FOLDER,
      } as FileNode);

      repository.listFolderNodes.mockResolvedValue({
        items: [],
        total: 0,
      });

      const query = new ListFolderQueryDto();
      query.parentId = '550e8400-e29b-41d4-a716-446655440000';

      const result = await service.listFolderNodes(tenantId, query);

      expect(repository.findById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        tenantId,
      );

      expect(repository.listFolderNodes).toHaveBeenCalledWith({
        tenantId,
        parentId: '550e8400-e29b-41d4-a716-446655440000',
        search: undefined,
        skip: 0,
        take: 20,
        orderBy: {
          name: 'asc',
        },
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('getNodeMetadata', () => {
    it('should return folder metadata', async () => {
      const folder = {
        id: 'folder-id',
        tenantId,
        createdBy: userId,
        name: 'Documents',
        nodeType: NodeType.FOLDER,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FileNode;

      repository.findById.mockResolvedValue(folder);

      const result = await service.getNodeMetadata(folder.id, tenantId);

      expect(repository.findById).toHaveBeenCalledWith(folder.id, tenantId);

      expect(result).toEqual({
        id: folder.id,
        name: folder.name,
        nodeType: NodeType.FOLDER,
        parentId: null,
        createdBy: folder.createdBy,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      });
    });

    it('should return file metadata', async () => {
      const file = {
        id: 'file-id',
        tenantId,
        createdBy: userId,
        name: 'sample.txt',
        nodeType: NodeType.FILE,
        parentId: 'parent-id',
        mimeType: 'text/plain',
        extension: 'txt',
        sizeBytes: BigInt(935),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FileNode;

      repository.findById.mockResolvedValue(file);

      const result = await service.getNodeMetadata(file.id, tenantId);

      expect(result).toEqual({
        id: file.id,
        name: file.name,
        nodeType: NodeType.FILE,
        parentId: file.parentId,
        mimeType: 'text/plain',
        extension: 'txt',
        sizeBytes: '935',
        createdBy: file.createdBy,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      });
    });

    it('should throw NotFoundException when node does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getNodeMetadata('missing-node', tenantId),
      ).rejects.toThrow(NotFoundException);

      expect(repository.findById).toHaveBeenCalledWith(
        'missing-node',
        tenantId,
      );
    });
  });

  describe('getNodeAncestors', () => {
    it('should return ancestor hierarchy', async () => {
      const root = {
        id: 'root',
        name: 'Root',
        nodeType: NodeType.FOLDER,
        parentId: null,
      } as FileNode;

      const docs = {
        id: 'docs',
        name: 'Documents',
        nodeType: NodeType.FOLDER,
        parentId: 'root',
      } as FileNode;

      const file = {
        id: 'file',
        name: 'sample.txt',
        nodeType: NodeType.FILE,
        parentId: 'docs',
      } as FileNode;

      repository.findById.mockImplementation(async (id) => {
        switch (id) {
          case 'file':
            return file;
          case 'docs':
            return docs;
          case 'root':
            return root;
          default:
            return null;
        }
      });

      const result = await service.getNodeAncestors('file', tenantId);

      expect(result).toEqual([
        {
          id: 'root',
          name: 'Root',
          nodeType: NodeType.FOLDER,
        },
        {
          id: 'docs',
          name: 'Documents',
          nodeType: NodeType.FOLDER,
        },
      ]);
    });

    it('should return empty array for root node', async () => {
      repository.findById.mockResolvedValue({
        id: 'root',
        name: 'Root',
        nodeType: NodeType.FOLDER,
        parentId: null,
      } as FileNode);

      const result = await service.getNodeAncestors('root', tenantId);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when node does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getNodeAncestors('missing', tenantId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when parent hierarchy is broken', async () => {
      repository.findById.mockImplementation(async (id) => {
        if (id === 'file') {
          return {
            id: 'file',
            parentId: 'parent',
            nodeType: NodeType.FILE,
          } as FileNode;
        }

        return null;
      });

      await expect(service.getNodeAncestors('file', tenantId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when cyclic hierarchy is detected', async () => {
      repository.findById.mockImplementation(async (id) => {
        if (id === 'file') {
          return {
            id: 'file',
            parentId: 'folder1',
            nodeType: NodeType.FILE,
          } as FileNode;
        }

        if (id === 'folder1') {
          return {
            id: 'folder1',
            parentId: 'folder2',
            nodeType: NodeType.FOLDER,
          } as FileNode;
        }

        if (id === 'folder2') {
          return {
            id: 'folder2',
            parentId: 'folder1',
            nodeType: NodeType.FOLDER,
          } as FileNode;
        }

        return null;
      });

      await expect(service.getNodeAncestors('file', tenantId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
