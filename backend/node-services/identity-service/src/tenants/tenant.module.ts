import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantRolesGuard } from '../auth/guards/tenant-roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TenantController],
  providers: [TenantService, TenantRolesGuard],
  exports: [TenantService],
})
export class TenantModule {}
