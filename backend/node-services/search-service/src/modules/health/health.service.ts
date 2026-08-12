import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  async check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => this.checkDatabase(),
    ]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        prisma: {
          status: 'up',
        },
      };
    } catch {
      return {
        prisma: {
          status: 'down',
        },
      };
    }
  }
}
