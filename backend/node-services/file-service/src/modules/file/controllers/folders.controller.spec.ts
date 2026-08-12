import { Test, TestingModule } from '@nestjs/testing';

import { FoldersController } from './folders.controller';
import { FolderService } from '../services/folder.service';
import { CreateFolderDto } from '../dto/create-folder.dto';

describe('FoldersController', () => {
  let controller: FoldersController;

  let folderService: jest.Mocked<FolderService>;

  beforeEach(async () => {
    folderService = {
      createFolder: jest.fn(),
    } as unknown as jest.Mocked<FolderService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoldersController],
      providers: [
        {
          provide: FolderService,
          useValue: folderService,
        },
      ],
    }).compile();

    controller = module.get<FoldersController>(FoldersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a folder', async () => {
    const dto: CreateFolderDto = {
      name: 'documents',
      parentId: null,
    };

    const tenantId = 'tenant-1';
    const userId = 'user-1';

    const folder = {
      id: 'folder-1',
      name: 'documents',
      parentId: null,
    };

    folderService.createFolder.mockResolvedValue(folder as never);

    const result = await controller.createFolder(dto, tenantId, userId);

    expect(folderService.createFolder).toHaveBeenCalledWith(
      dto,
      tenantId,
      userId,
    );

    expect(result).toBe(folder);
  });

  it('should pass nested folder request to service', async () => {
    const dto: CreateFolderDto = {
      name: 'child-folder',
      parentId: 'parent-id',
    };

    const tenantId = 'tenant-1';
    const userId = 'user-1';

    folderService.createFolder.mockResolvedValue({} as never);

    await controller.createFolder(dto, tenantId, userId);

    expect(folderService.createFolder).toHaveBeenCalledWith(
      dto,
      tenantId,
      userId,
    );
  });
});
