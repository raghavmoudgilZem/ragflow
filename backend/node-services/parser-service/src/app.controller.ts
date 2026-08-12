import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthCheckData } from 'common/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/health')
  getHealth(): HealthCheckData {
    return this.appService.getHealth();
  }
}
