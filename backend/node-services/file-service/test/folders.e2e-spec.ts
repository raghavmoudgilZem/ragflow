import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { PrismaService } from '../src/prisma/prisma.service';

import { createTestApp } from './helpers/app.helper';
import { TEST_HEADERS } from './helpers/test-headers';
import { FolderFixtures } from './fixtures/folder.fixtures';

describe('Folders API (e2e)', () => {
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

  describe('POST /api/v1/folders', () => {
    it('should reject invalid request body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/folders')
        .set(TEST_HEADERS)
        .send({
          name: '',
        })
        .expect(400);
    });

    it('should create a root folder', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/folders')
        .set(TEST_HEADERS)
        .send(FolderFixtures.rootFolder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(201);
      expect(response.body.error).toBeNull();

      expect(response.body.data).toEqual(
        expect.objectContaining({
          name: FolderFixtures.rootFolder.name,
          nodeType: 'FOLDER',
        }),
      );

      const folder = await prisma.fileNode.findUnique({
        where: {
          id: response.body.data.id,
        },
      });

      expect(folder).not.toBeNull();
      expect(folder?.name).toBe(FolderFixtures.rootFolder.name);
    });
  });

  describe('GET /api/v1/nodes', () => {
    it('should return root folder nodes', async () => {
      await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'Documents',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/documents/',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/nodes')
        .set(TEST_HEADERS)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(200);
      expect(response.body.error).toBeNull();

      expect(response.body.data.items).toHaveLength(1);

      expect(response.body.data.items[0]).toEqual(
        expect.objectContaining({
          name: 'Documents',
          nodeType: 'FOLDER',
        }),
      );

      expect(response.body.data.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        }),
      );
    });

    it('should return child folder nodes', async () => {
      const parent = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'Parent',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/parent/',
        },
      });

      await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          parentId: parent.id,
          name: 'Child',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/parent/child/',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/nodes')
        .query({
          parentId: parent.id,
        })
        .set(TEST_HEADERS)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status_code).toBe(200);
      expect(response.body.error).toBeNull();

      expect(response.body.data.items).toHaveLength(1);

      expect(response.body.data.items[0]).toEqual(
        expect.objectContaining({
          name: 'Child',
          parentId: parent.id,
        }),
      );
    });

    it('should return 404 when parent folder does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/nodes')
        .query({
          parentId: '550e8400-e29b-41d4-a716-446655440000',
        })
        .set(TEST_HEADERS)
        .expect(404);
      expect(response.body.success).toBe(false);
      expect(response.body.status_code).toBe(404);
      expect(response.body.data).toBeNull();
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when parent is a file', async () => {
      const file = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'sample.pdf',
          nodeType: 'FILE',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/sample.pdf',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/nodes')
        .query({
          parentId: file.id,
        })
        .set(TEST_HEADERS)
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.status_code).toBe(400);
      expect(response.body.data).toBeNull();
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/nodes/:id', () => {
    it('should return folder metadata', async () => {
      const folder = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'Documents',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/documents/',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/nodes/${folder.id}`)
        .set(TEST_HEADERS)
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: folder.id,
          name: 'Documents',
          nodeType: 'FOLDER',
          parentId: null,
        }),
      );
    });

    it('should return file metadata', async () => {
      const folder = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'Documents',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/documents/',
        },
      });

      const file = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          parentId: folder.id,
          name: 'sample.pdf',
          nodeType: 'FILE',
          mimeType: 'application/pdf',
          extension: 'pdf',
          sizeBytes: BigInt(1024),
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/documents/sample.pdf',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/nodes/${file.id}`)
        .set(TEST_HEADERS)
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: file.id,
          name: 'sample.pdf',
          nodeType: 'FILE',
          mimeType: 'application/pdf',
          extension: 'pdf',
          sizeBytes: '1024',
        }),
      );
    });

    it('should return 404 when node does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/nodes/550e8400-e29b-41d4-a716-446655440000')
        .set(TEST_HEADERS)
        .expect(404);
    });
  });

  describe('GET /api/v1/nodes/:id/ancestors', () => {
    it('should return ancestor hierarchy', async () => {
      const root = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'Root',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/root/',
        },
      });

      const docs = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          parentId: root.id,
          name: 'Documents',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/root/documents/',
        },
      });

      const file = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          parentId: docs.id,
          name: 'sample.pdf',
          nodeType: 'FILE',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/root/documents/sample.pdf',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/nodes/${file.id}/ancestors`)
        .set(TEST_HEADERS)
        .expect(200);

      expect(response.body.data).toEqual([
        {
          id: root.id,
          name: 'Root',
          nodeType: 'FOLDER',
        },
        {
          id: docs.id,
          name: 'Documents',
          nodeType: 'FOLDER',
        },
      ]);
    });

    it('should return empty array for a root folder', async () => {
      const root = await prisma.fileNode.create({
        data: {
          tenantId: TEST_HEADERS['x-tenant-id'],
          createdBy: TEST_HEADERS['x-user-id'],
          name: 'Root',
          nodeType: 'FOLDER',
          storageProvider: 'LOCAL',
          storageBucket: '',
          storageKey: 'tenant-1/root/',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/nodes/${root.id}/ancestors`)
        .set(TEST_HEADERS)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should return 404 when node does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/nodes/550e8400-e29b-41d4-a716-446655440000/ancestors')
        .set(TEST_HEADERS)
        .expect(404);
    });
  });
});
