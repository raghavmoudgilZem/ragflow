import { Test, TestingModule } from '@nestjs/testing';

import { FilesController } from './files.controller';
import { FileService } from '../services/file.service';
import { MIME_TYPE } from '../../../common/constants/file.constants';

describe('FilesController', () => {
  let controller: FilesController;
  let fileService: jest.Mocked<FileService>;

  beforeEach(async () => {
    fileService = {
      uploadFiles: jest.fn(),
    } as unknown as jest.Mocked<FileService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FileService,
          useValue: fileService,
        },
      ],
    }).compile();

    controller = module.get(FilesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload files successfully', async () => {
    const dto = {
      parentId: 'parent-id',
    };

    const files = [
      {
        originalname: 'sample.pdf',
        mimetype: MIME_TYPE.PDF,
        size: 1024,
      },
    ] as Express.Multer.File[];

    const response = {
      successful: [
        {
          id: 'file-id',
          name: 'sample.pdf',
          mimeType: MIME_TYPE.PDF,
          sizeBytes: 1024,
        },
      ],
      failed: [],
    };

    fileService.uploadFiles.mockResolvedValue(response);

    const result = await controller.uploadFiles(
      dto,
      files,
      'tenant-1',
      'user-1',
    );

    expect(fileService.uploadFiles).toHaveBeenCalledWith(
      dto,
      files,
      'tenant-1',
      'user-1',
    );

    expect(result).toEqual(response);
  });

  it('should upload files to the root folder', async () => {
    const dto = {};

    const files = [
      {
        originalname: 'sample.pdf',
        mimetype: MIME_TYPE.PDF,
        size: 1024,
      },
    ] as Express.Multer.File[];

    const response = {
      successful: [],
      failed: [],
    };

    fileService.uploadFiles.mockResolvedValue(response);

    await controller.uploadFiles(dto, files, 'tenant-1', 'user-1');

    expect(fileService.uploadFiles).toHaveBeenCalledWith(
      dto,
      files,
      'tenant-1',
      'user-1',
    );
  });

  it('should propagate service errors', async () => {
    const dto = {};

    const files = [] as Express.Multer.File[];

    fileService.uploadFiles.mockRejectedValue(new Error('Upload failed'));

    await expect(
      controller.uploadFiles(dto, files, 'tenant-1', 'user-1'),
    ).rejects.toThrow('Upload failed');
  });
});
