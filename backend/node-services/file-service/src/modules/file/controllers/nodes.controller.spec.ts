import { Test, TestingModule } from '@nestjs/testing';
import { NodeType } from '@prisma/client';

import { NodesController } from './nodes.controller';
import { FolderService } from '../services/folder.service';
import { ListFolderQueryDto } from '../dto/list-folder-query.dto';
import { NodeAncestorResponseDto } from '../dto/node-ancestor-response.dto';
import { NodeMetadataResponseDto } from '../dto/node-metadata-response.dto';

describe('NodesController', () => {
  let controller: NodesController;

  let folderService: jest.Mocked<FolderService>;

  beforeEach(async () => {
    folderService = {
      listFolderNodes: jest.fn(),
      getNodeMetadata: jest.fn(),
      getNodeAncestors: jest.fn(),
    } as unknown as jest.Mocked<FolderService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodesController],
      providers: [
        {
          provide: FolderService,
          useValue: folderService,
        },
      ],
    }).compile();

    controller = module.get<NodesController>(NodesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list root folder nodes', async () => {
    const tenantId = 'tenant-1';

    const query = new ListFolderQueryDto();

    const response = {
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };

    folderService.listFolderNodes.mockResolvedValue(response);

    const result = await controller.listFolderNodes(tenantId, query);

    expect(folderService.listFolderNodes).toHaveBeenCalledWith(tenantId, query);

    expect(result).toBe(response);
  });

  it('should pass parentId to service', async () => {
    const tenantId = 'tenant-1';

    const query = new ListFolderQueryDto();
    query.parentId = '550e8400-e29b-41d4-a716-446655440000';

    folderService.listFolderNodes.mockResolvedValue({} as never);

    await controller.listFolderNodes(tenantId, query);

    expect(folderService.listFolderNodes).toHaveBeenCalledWith(tenantId, query);
  });

  describe('getNodeMetadata', () => {
    it('should return node metadata', async () => {
      const response: NodeMetadataResponseDto = {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'document.pdf',
        nodeType: NodeType.FILE,
        parentId: '22222222-2222-4222-8222-222222222222',
        createdBy: '33333333-3333-4333-8333-333333333333',
        createdAt: new Date(),
        updatedAt: new Date(),
        mimeType: 'application/pdf',
        extension: '.pdf',
        sizeBytes: '1024',
      };
      const tenantId = 'tenant-1';

      folderService.getNodeMetadata.mockResolvedValue(response);

      await expect(
        controller.getNodeMetadata(tenantId, response.id),
      ).resolves.toEqual(response);

      expect(folderService.getNodeMetadata).toHaveBeenCalledWith(
        response.id,
        tenantId,
      );
    });
  });

  describe('getNodeAncestors', () => {
    it('should return node ancestors', async () => {
      const response: NodeAncestorResponseDto[] = [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Root',
          nodeType: NodeType.FOLDER,
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Projects',
          nodeType: NodeType.FOLDER,
        },
      ];
      const tenantId = 'tenant-1';

      folderService.getNodeAncestors.mockResolvedValue(response);

      await expect(
        controller.getNodeAncestors(
          tenantId,
          '33333333-3333-4333-8333-333333333333',
        ),
      ).resolves.toEqual(response);

      expect(folderService.getNodeAncestors).toHaveBeenCalledWith(
        '33333333-3333-4333-8333-333333333333',
        tenantId,
      );
    });
  });
});
