import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'UP',
      service: 'file-service',
      timestamp: new Date().toISOString(),
    };
  }
}
