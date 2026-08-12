import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaService } from '../../prisma.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  controllers: [SearchController],
  providers: [SearchService, PrismaService, AuthGuard],
  exports: [SearchService],
})
export class SearchModule {}
