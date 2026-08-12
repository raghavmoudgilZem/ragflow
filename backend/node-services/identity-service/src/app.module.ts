import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenants/tenant.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, RedisModule, TenantModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
