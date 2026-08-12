import { Injectable } from '@nestjs/common';
import { HealthCheckData } from 'common/types';

@Injectable()
export class AppService {
  getHealth(): HealthCheckData {
    return {
      timestamp: Date.now(),
      uptime: `${process.uptime()} sec`,
    };
  }
}
