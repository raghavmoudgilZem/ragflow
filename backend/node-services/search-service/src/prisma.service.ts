import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 1. Initialize NestJS Logger specifically for this service
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://localhost:3306');

    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname,
      port: Number(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace('/', ''),
    });

    super({ adapter });
  }

  async onModuleInit() {
    try {
      // 2. Attempt explicit connection on application startup
      await this.$connect();
      this.logger.log(
        'Successfully connected to MariaDB/MySQL database via Prisma driver adapter!',
      );
    } catch (error) {
      this.logger.error('Failed to establish database connection:', error);
      // Optional: Prevent the application from booting up if the database is unreachable
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from MariaDB/MySQL database cleanly.');
  }
}
