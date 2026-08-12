import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get('queue.redis'),
        defaultJobOptions: configService.get('queue.defaultJobOptions'),
      }),
    }),
    BullModule.registerQueue(
      { name: 'parsing' },
      { name: 'indexing' },
    ),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
