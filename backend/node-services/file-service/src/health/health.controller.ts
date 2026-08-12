import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running successfully.',
  })
  getHealth() {
    return this.healthService.getHealth();
  }
}
