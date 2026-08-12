import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { PrismaService } from '../src/prisma/prisma.service';

import { FileFixtures } from './fixtures/file.fixtures';
import { FolderFixtures } from './fixtures/folder.fixtures';
import { createTestApp } from './helpers/app.helper';
import { TEST_HEADERS } from './helpers/test-headers';

describe('Files API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await prisma.fileNode.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/files/upload', () => {
    it('should reject request without files', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .expect(400);
    });

    it('should upload a root file', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .attach('files', FileFixtures.rootUpload.content, {
          filename: FileFixtures.rootUpload.fileName,
          contentType: FileFixtures.rootUpload.mimeType,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(201);
      expect(response.body.error).toBeNull();

      expect(response.body.data.successful).toHaveLength(1);
      expect(response.body.data.failed).toHaveLength(0);

      expect(response.body.data.successful[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: FileFixtures.rootUpload.fileName,
          mimeType: FileFixtures.rootUpload.mimeType,
          sizeBytes: FileFixtures.rootUpload.content.length,
        }),
      );

      const file = await prisma.fileNode.findUnique({
        where: {
          id: response.body.data.successful[0].id,
        },
      });

      expect(file).not.toBeNull();
      expect(file?.parentId).toBeNull();
      expect(file?.name).toBe(FileFixtures.rootUpload.fileName);
    });

    it('should upload a file into a folder', async () => {
      const folder = await prisma.fileNode.create({
        data: FolderFixtures.rootFolderForUpload,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .field('parentId', folder.id)
        .attach('files', FileFixtures.nestedUpload.content, {
          filename: FileFixtures.nestedUpload.fileName,
          contentType: FileFixtures.nestedUpload.mimeType,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(201);
      expect(response.body.error).toBeNull();

      expect(response.body.data.successful).toHaveLength(1);

      const uploaded = await prisma.fileNode.findUnique({
        where: {
          id: response.body.data.successful[0].id,
        },
      });

      expect(uploaded).not.toBeNull();
      expect(uploaded?.parentId).toBe(folder.id);
      expect(uploaded?.name).toBe(FileFixtures.nestedUpload.fileName);
    });

    it('should reject duplicate file names in the same folder', async () => {
      const folder = await prisma.fileNode.create({
        data: FolderFixtures.rootFolderForUpload,
      });

      await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .field('parentId', folder.id)
        .attach('files', FileFixtures.duplicateUpload.content, {
          filename: FileFixtures.duplicateUpload.fileName,
          contentType: FileFixtures.duplicateUpload.mimeType,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .field('parentId', folder.id)
        .attach('files', FileFixtures.duplicateUpload.content, {
          filename: FileFixtures.duplicateUpload.fileName,
          contentType: FileFixtures.duplicateUpload.mimeType,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(201);
      expect(response.body.error).toBeNull();

      expect(response.body.data.successful).toHaveLength(0);
      expect(response.body.data.failed).toHaveLength(1);

      expect(response.body.data.failed[0].fileName).toBe(
        FileFixtures.duplicateUpload.fileName,
      );
    });

    it('should reject unsupported file type', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .attach('files', FileFixtures.invalidMimeUpload.content, {
          filename: FileFixtures.invalidMimeUpload.fileName,
          contentType: FileFixtures.invalidMimeUpload.mimeType,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(201);
      expect(response.body.error).toBeNull();

      expect(response.body.data.successful).toHaveLength(0);
      expect(response.body.data.failed).toHaveLength(1);

      expect(response.body.data.failed[0].fileName).toBe(
        FileFixtures.invalidMimeUpload.fileName,
      );
    });

    it('should reject upload when parent folder does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set(TEST_HEADERS)
        .field('parentId', '11111111-1111-1111-1111-111111111111')
        .attach('files', FileFixtures.rootUpload.content, {
          filename: FileFixtures.rootUpload.fileName,
          contentType: FileFixtures.rootUpload.mimeType,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.status_code).toBe(404);
      expect(response.body.data).toBeNull();
      expect(response.body.error).toBeDefined();
    });
  });
});
