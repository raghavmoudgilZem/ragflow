import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { DatasetController } from "./dataset.controller";
import { DatasetService } from "./dataset.service";
import { PrismaService } from "../infrastructure/database/prisma.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  controllers: [DatasetController],
  providers: [DatasetService, PrismaService],
})
export class DatasetModule {}
