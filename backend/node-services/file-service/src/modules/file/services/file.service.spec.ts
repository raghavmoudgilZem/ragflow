import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NodeType, StorageProvider } from '@prisma/client';

import { FileService } from './file.service';
import { FileNodeRepository } from '../repositories/file-node.repository.interface';
import { StorageKeyBuilder } from '../storage/builders/storage-key.builder';
import { FileStorageService } from '../storage/services/file-storage.service';

describe('FileService', () => {
  let service: FileService;

  const repository = {
    findById: jest.fn(),
    existsByParentAndName: jest.fn(),
    createFile: jest.fn(),
  } as unknown as jest.Mocked<FileNodeRepository>;

  const fileStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  } as unknown as jest.Mocked<FileStorageService>;

  const storageKeyBuilder = {
    buildRootFileKey: jest.fn(),
    buildFileKey: jest.fn(),
  } as unknown as jest.Mocked<StorageKeyBuilder>;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new FileService(
      repository,
      fileStorageService,
      storageKeyBuilder,
    );
  });

  const mockParent = {
    id: 'parent-id',
    nodeType: NodeType.FOLDER,
    storageKey: 'tenant-1/Documents',
  } as any;

  const mockFile: Express.Multer.File = {
    fieldname: 'files',
    originalname: 'sample.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    destination: '',
    filename: '',
    path: '',
    buffer: Buffer.from('sample'),
    stream: undefined,
  };
  it('should throw NotFoundException when parent folder does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.uploadFiles(
        { parentId: 'missing-parent' },
        [mockFile],
        'tenant-1',
        'user-1',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when parent is not a folder', async () => {
    repository.findById.mockResolvedValue({
      ...mockParent,
      nodeType: NodeType.FILE,
    });

    await expect(
      service.uploadFiles(
        { parentId: 'parent-id' },
        [mockFile],
        'tenant-1',
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should upload a file successfully', async () => {
    repository.findById.mockResolvedValue(mockParent);
    repository.existsByParentAndName.mockResolvedValue(false);

    storageKeyBuilder.buildFileKey.mockReturnValue(
      'tenant-1/Documents/sample.pdf',
    );

    fileStorageService.uploadFile.mockResolvedValue({
      provider: StorageProvider.LOCAL,
      address: {
        bucket: null,
        storageKey: 'tenant-1/Documents/sample.pdf',
      },
    });

    repository.createFile.mockResolvedValue({
      id: 'file-id',
      name: 'sample.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(1024),
    } as any);

    const response = await service.uploadFiles(
      { parentId: 'parent-id' },
      [mockFile],
      'tenant-1',
      'user-1',
    );

    expect(response.successful).toHaveLength(1);
    expect(response.failed).toHaveLength(0);

    expect(storageKeyBuilder.buildFileKey).toHaveBeenCalledWith(
      'tenant-1/Documents',
      'sample.pdf',
    );

    expect(fileStorageService.uploadFile).toHaveBeenCalledWith(
      'tenant-1/Documents/sample.pdf',
      expect.anything(),
      mockFile.size,
      mockFile.mimetype,
    );

    expect(repository.createFile).toHaveBeenCalledTimes(1);
    expect(fileStorageService.uploadFile).toHaveBeenCalledTimes(1);
  });

  it('should rollback uploaded file when database save fails', async () => {
    repository.findById.mockResolvedValue(mockParent);
    repository.existsByParentAndName.mockResolvedValue(false);

    storageKeyBuilder.buildFileKey.mockReturnValue(
      'tenant-1/Documents/sample.pdf',
    );

    fileStorageService.uploadFile.mockResolvedValue({
      provider: StorageProvider.LOCAL,
      address: {
        bucket: null,
        storageKey: 'tenant-1/Documents/sample.pdf',
      },
    });

    repository.createFile.mockRejectedValue(new Error('Database failure'));

    const response = await service.uploadFiles(
      { parentId: 'parent-id' },
      [mockFile],
      'tenant-1',
      'user-1',
    );

    expect(response.successful).toHaveLength(0);
    expect(response.failed).toHaveLength(1);

    expect(fileStorageService.deleteFile).toHaveBeenCalledTimes(1);

    expect(fileStorageService.deleteFile).toHaveBeenCalledWith(
      StorageProvider.LOCAL,
      {
        bucket: null,
        storageKey: 'tenant-1/Documents/sample.pdf',
      },
    );
  });

  it('should reject an empty file', async () => {
    const emptyFile = {
      ...mockFile,
      size: 0,
    };

    const response = await service.uploadFiles(
      {},
      [emptyFile],
      'tenant-1',
      'user-1',
    );

    expect(response.successful).toHaveLength(0);
    expect(response.failed).toHaveLength(1);
    expect(response.failed[0].fileName).toBe('sample.pdf');
  });

  it('should reject unsupported mime type', async () => {
    const invalidFile = {
      ...mockFile,
      mimetype: 'application/x-msdownload',
      originalname: 'virus.exe',
    };

    const response = await service.uploadFiles(
      {},
      [invalidFile],
      'tenant-1',
      'user-1',
    );
    expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
    expect(repository.createFile).not.toHaveBeenCalled();
    expect(response.successful).toHaveLength(0);
    expect(response.failed).toHaveLength(1);
    expect(response.failed[0].fileName).toBe('virus.exe');
  });

  it('should reject duplicate file name', async () => {
    repository.existsByParentAndName.mockResolvedValue(true);

    const response = await service.uploadFiles(
      {},
      [mockFile],
      'tenant-1',
      'user-1',
    );

    expect(response.successful).toHaveLength(0);
    expect(response.failed).toHaveLength(1);

    expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
    expect(repository.createFile).not.toHaveBeenCalled();
  });

  it('should build root storage key when uploading to root', async () => {
    repository.existsByParentAndName.mockResolvedValue(false);

    storageKeyBuilder.buildRootFileKey.mockReturnValue('tenant-1/sample.pdf');

    fileStorageService.uploadFile.mockResolvedValue({
      provider: StorageProvider.LOCAL,
      address: {
        bucket: null,
        storageKey: 'tenant-1/sample.pdf',
      },
    });

    repository.createFile.mockResolvedValue({
      id: 'file-id',
      name: 'sample.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(1024),
    } as any);

    await service.uploadFiles({}, [mockFile], 'tenant-1', 'user-1');

    expect(storageKeyBuilder.buildRootFileKey).toHaveBeenCalledWith(
      'tenant-1',
      'sample.pdf',
    );
  });

  it('should upload multiple valid files', async () => {
    repository.existsByParentAndName.mockResolvedValue(false);

    storageKeyBuilder.buildRootFileKey
      .mockReturnValueOnce('tenant-1/file1.pdf')
      .mockReturnValueOnce('tenant-1/file2.pdf');

    fileStorageService.uploadFile.mockResolvedValue({
      provider: StorageProvider.LOCAL,
      address: {
        bucket: null,
        storageKey: 'tenant-1/file.pdf',
      },
    });

    repository.createFile
      .mockResolvedValueOnce({
        id: 'file-1',
        name: 'file1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(100),
      } as any)
      .mockResolvedValueOnce({
        id: 'file-2',
        name: 'file2.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(200),
      } as any);

    const response = await service.uploadFiles(
      {},
      [
        {
          ...mockFile,
          originalname: 'file1.pdf',
          size: 100,
        },
        {
          ...mockFile,
          originalname: 'file2.pdf',
          size: 200,
        },
      ],
      'tenant-1',
      'user-1',
    );

    expect(response.successful).toHaveLength(2);
    expect(response.failed).toHaveLength(0);
    expect(repository.createFile).toHaveBeenCalledTimes(2);
    expect(fileStorageService.uploadFile).toHaveBeenCalledTimes(2);
  });
});
