import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { EMAIL_PROVIDER } from './providers/email-provider.interface';
import { NotificationProcessor } from './queues/notification.processor';
import { NOTIFICATION_QUEUE } from './queues/notification.queue';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationProcessor,

    {
      provide: EMAIL_PROVIDER,
      useClass: SendGridProvider,
    },
  ],
})
export class NotificationModule {}
