import { INestApplication } from '@nestjs/common';
import request = require('supertest');

import { createTestApp } from './helpers/app.helper';

describe('Health API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health should return service status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.status_code).toBe(200);
    expect(response.body.error).toBeNull();

    expect(response.body.data.status).toBe('UP');
  });
});
