import { QueueNotificationDto } from '../dto/queue-notification.dto';

export const NOTIFICATION_QUEUE = 'notification';
export const SEND_NOTIFICATION_JOB = 'send';

export interface NotificationJobPayload extends QueueNotificationDto {
  transactionId: string;
}
