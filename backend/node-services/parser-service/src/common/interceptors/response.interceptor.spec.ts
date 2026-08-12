import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';

@Controller('probe')
class ProbeController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create() {
    return { jobId: 'job-1' };
  }

  @Get()
  read() {
    return { ok: true };
  }

  @Get('empty')
  empty() {
    return undefined;
  }
}

describe('ResponseInterceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProbeController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(() => app.close());

  it('wraps the payload and picks up the @HttpCode status', async () => {
    const res = await request(app.getHttpServer() as App).post('/probe');

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toEqual({
      success: true,
      status_code: HttpStatus.CREATED,
      data: { jobId: 'job-1' },
    });
  });

  it('defaults to the response status for plain handlers', async () => {
    const res = await request(app.getHttpServer() as App).get('/probe');

    expect(res.body).toEqual({
      success: true,
      status_code: HttpStatus.OK,
      data: { ok: true },
    });
  });

  it('still returns an envelope when a handler yields nothing', async () => {
    const res = await request(app.getHttpServer() as App).get('/probe/empty');

    expect(res.body).toEqual({ success: true, status_code: HttpStatus.OK });
  });

  it('leaves non-HTTP results untouched', () => {
    const context = {
      getType: () => 'rpc',
    } as unknown as ExecutionContext;
    const next = { handle: () => of('rpc-result') } as CallHandler;

    let received: unknown;
    new ResponseInterceptor()
      .intercept(context, next)
      .subscribe((value) => (received = value));

    expect(received).toBe('rpc-result');
  });
});
