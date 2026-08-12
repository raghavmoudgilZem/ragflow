import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EMAIL_PROVIDER,
  EmailProvider,
} from '../providers/email-provider.interface';
import {
  NOTIFICATION_QUEUE,
  SEND_NOTIFICATION_JOB,
  NotificationJobPayload,
} from './notification.queue';

@Processor(NOTIFICATION_QUEUE)
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {
    super();
  }

  async process(job: Job<NotificationJobPayload>): Promise<void> {
    if (job.name !== SEND_NOTIFICATION_JOB) return;

    const { transactionId, ...dto } = job.data;
    this.logger.log(
      `Processing job ${job.id} — transactionId: ${transactionId}, recipient: ${dto.recipient}`,
    );

    // Mark job as processing + write audit
    await this.prisma.notificationJob.updateMany({
      where: { transactionId },
      data: { status: 'processing' },
    });
    await this.writeAuditLog(transactionId, 'processing', `Worker picked up job ${job.id}`);

    try {
      // Resolve template by slug — use latest version
      const template = await this.prisma.emailTemplate.findFirst({
        where: { templateSlug: dto.template_id, isLatest: true },
      });

      if (!template) {
        throw new Error(`Template slug "${dto.template_id}" not found`);
      }

      if (!template.status) {
        throw new Error(`Template "${dto.template_id}" is inactive`);
      }

      // Render template
      const data = dto.data as Record<string, string>;
      const rendered = this.renderTemplate(template, data);

      // Send via provider
      const response = await this.emailProvider.sendEmail({
        to: dto.recipient,
        subject: rendered.subject,
        html: rendered.html,
        metadata: { templateSlug: dto.template_id, transactionId },
      });

      // Mark job as sent + write audit
      await this.prisma.notificationJob.updateMany({
        where: { transactionId },
        data: {
          status: 'sent',
          templateId: template.templateId,
          processedAt: new Date(),
        },
      });
      await this.writeAuditLog(
        transactionId,
        'sent',
        `Delivered — messageId: ${response.messageId}`,
      );

      this.logger.log(
        `Job ${job.id} delivered — transactionId: ${transactionId}, messageId: ${response.messageId}`,
      );
    } catch (err: any) {
      const errorMessage: string = err?.message ?? 'Unknown error';
      this.logger.error(`Job ${job.id} failed: ${errorMessage}`, err);

      const isRetrying = job.attemptsMade < (job.opts.attempts ?? 1) - 1;
      const event = isRetrying ? 'retrying' : 'failed';

      await this.prisma.notificationJob.updateMany({
        where: { transactionId },
        data: {
          status: isRetrying ? 'processing' : 'failed',
          errorMessage,
          processedAt: isRetrying ? undefined : new Date(),
        },
      });
      await this.writeAuditLog(
        transactionId,
        event,
        `Attempt ${job.attemptsMade + 1}: ${errorMessage}`,
      );

      // Re-throw so BullMQ marks the job as failed and can retry
      throw err;
    }
  }

  private async writeAuditLog(
    transactionId: string,
    event: 'created' | 'processing' | 'sent' | 'failed' | 'retrying',
    detail?: string,
  ) {
    return this.prisma.notificationAuditLog.create({
      data: { transactionId, event: event as any, detail: detail ?? null },
    });
  }

  private renderTemplate(
    template: { subject?: string | null; template: string },
    data: Record<string, string>,
  ): { subject: string; html: string } {
    const replace = (source: string) =>
      source.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => data[key] ?? '');

    return {
      subject: replace(template.subject ?? ''),
      html: replace(template.template),
    };
  }
}
