import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConfigurationModule } from "./config/config.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { StorageModule } from "./infrastructure/storage/storage.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { DatasetModule } from "./dataset/dataset.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ConfigurationModule,
    DatabaseModule,
    StorageModule,
    QueueModule,
    HealthModule,
    AuthModule,
    DatasetModule,
  ],
})
export class AppModule {}
