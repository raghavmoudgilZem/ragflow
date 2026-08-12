import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  EMAIL_PROVIDER,
  EmailProvider,
} from './providers/email-provider.interface';
import { SendNotificationDto } from './dto/send-notification.dto';
import { QueueNotificationDto } from './dto/queue-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import {
  NOTIFICATION_QUEUE,
  SEND_NOTIFICATION_JOB,
  NotificationJobPayload,
} from './queues/notification.queue';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
    private readonly prisma: PrismaService,
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
  ) {}

  /** Queue a notification request for asynchronous processing. */
  async queueNotification(dto: QueueNotificationDto) {
    // Validate template slug exists before queuing — use latest active version
    const template = await this.prisma.emailTemplate.findFirst({
      where: { templateSlug: dto.template_id, isLatest: true },
      select: { templateId: true, status: true },
    });

    if (!template) {
      throw new NotFoundException(
        `Template slug "${dto.template_id}" not found`,
      );
    }

    if (!template.status) {
      throw new BadRequestException(
        `Template "${dto.template_id}" is inactive`,
      );
    }

    // Create a job tracking row — transactionId is auto-generated as UUID
    const jobRow = await this.prisma.notificationJob.create({
      data: {
        recipient: dto.recipient,
        channel: dto.channel as any,
        templateSlug: dto.template_id,
        templateId: template.templateId,
        data: JSON.stringify(dto.data),
        sourceService: dto.metadata?.source_service ?? null,
        correlationId: dto.metadata?.correlation_id ?? null,
        status: 'queued',
      },
    });

    // Write the first audit entry
    await this.writeAuditLog(jobRow.transactionId, 'created', 'Notification request accepted and queued');

    // Enqueue into BullMQ — include transactionId in payload for the processor
    const payload: NotificationJobPayload = { ...dto, transactionId: jobRow.transactionId };
    const job = await this.notificationQueue.add(SEND_NOTIFICATION_JOB, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    // Store the Bull job ID for cross-reference
    await this.prisma.notificationJob.update({
      where: { jobId: jobRow.jobId },
      data: { bullJobId: String(job.id) },
    });

    this.logger.log(
      `Queued notification job ${job.id} — transactionId: ${jobRow.transactionId}, recipient: ${dto.recipient}`,
    );

    return {
      transactionId: jobRow.transactionId,
      jobId: jobRow.jobId.toString(),
      bullJobId: String(job.id),
      recipient: dto.recipient,
      channel: dto.channel,
      templateId: dto.template_id,
      status: 'queued',
    };
  }

  /** Get full transaction status and latest audit entry. */
  async findTransaction(transactionId: string) {
    const job = await this.prisma.notificationJob.findUnique({
      where: { transactionId },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Transaction "${transactionId}" not found`);
    }

    return {
      transactionId: job.transactionId,
      recipient: job.recipient,
      channel: job.channel,
      templateSlug: job.templateSlug,
      status: job.status,
      sourceService: job.sourceService,
      correlationId: job.correlationId,
      createdAt: job.createdAt,
      processedAt: job.processedAt,
      latestEvent: job.auditLogs[0] ?? null,
    };
  }

  /** Get the full ordered audit trail for a transaction. */
  async findTransactionAudit(transactionId: string) {
    const job = await this.prisma.notificationJob.findUnique({
      where: { transactionId },
      select: { jobId: true },
    });

    if (!job) {
      throw new NotFoundException(`Transaction "${transactionId}" not found`);
    }

    return this.prisma.notificationAuditLog.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendNotification(dto: SendNotificationDto) {
    // 1 — Load config
    const config = await this.prisma.notificationServiceConfig.findUnique({
      where: { configId: BigInt(dto.configId) },
    });

    if (!config) {
      throw new NotFoundException(
        `Notification config #${dto.configId} not found`,
      );
    }

    if (!config.status) {
      throw new BadRequestException(
        `Notification config #${dto.configId} is disabled`,
      );
    }

    // 2 — Load template
    const template = await this.prisma.emailTemplate.findUnique({
      where: { templateId: BigInt(dto.templateId) },
    });

    if (!template) {
      throw new NotFoundException(
        `Email template #${dto.templateId} not found`,
      );
    }

    if (!template.status) {
      throw new BadRequestException(
        `Email template #${dto.templateId} is inactive`,
      );
    }

    // 3 — Create a NotificationJob row for transaction tracking
    const jobRow = await this.prisma.notificationJob.create({
      data: {
        recipient: dto.recipient,
        channel: 'EMAIL' as any,
        templateSlug: template.templateSlug,
        templateId: template.templateId,
        data: JSON.stringify(dto.data),
        status: 'processing' as any,
      },
    });
    await this.writeAuditLog(
      jobRow.transactionId,
      'created',
      'Direct send request accepted',
    );

    const rendered = this.renderTemplate(template, dto.data);

    let logStatus: 'sent' | 'failed' = 'failed';
    let providerMessageId: string | null = null;

    try {
      const response = await this.emailProvider.sendEmail({
        to: dto.recipient,
        subject: rendered.subject,
        html: rendered.html,
        metadata: {
          templateId: String(dto.templateId),
          configId: String(dto.configId),
          transactionId: jobRow.transactionId,
        },
      });

      logStatus = response.status;
      providerMessageId = response.messageId;

      this.logger.log(
        `Notification sent — recipient: ${dto.recipient}, messageId: ${providerMessageId}`,
      );
    } catch (err: any) {
      this.logger.error(`Delivery failed for ${dto.recipient}`, err);
      await this.prisma.notificationJob.update({
        where: { jobId: jobRow.jobId },
        data: {
          status: 'failed' as any,
          errorMessage: err?.message ?? 'Unknown error',
          processedAt: new Date(),
        },
      });
      await this.writeAuditLog(
        jobRow.transactionId,
        'failed',
        err?.message ?? 'Unknown error',
      );
      await this.writeLog(dto, 'failed');
      throw err;
    }

    // 4 — Mark job as sent and write audit log
    await this.prisma.notificationJob.update({
      where: { jobId: jobRow.jobId },
      data: { status: 'sent' as any, processedAt: new Date() },
    });
    await this.writeAuditLog(
      jobRow.transactionId,
      'sent',
      `Delivered — messageId: ${providerMessageId}`,
    );

    const log = await this.writeLog(dto, logStatus);

    return {
      transactionId: jobRow.transactionId,
      logId: log.emailLogId.toString(),
      recipient: dto.recipient,
      status: logStatus,
      messageId: providerMessageId,
      sentAt: log.sentAt,
    };
  }


  async createTemplate(dto: CreateTemplateDto) {
    const existing = await this.prisma.emailTemplate.findFirst({
      where: { templateSlug: dto.templateSlug },
      select: { templateSlug: true },
    });
    if (existing) {
      throw new BadRequestException(
        `Template slug "${dto.templateSlug}" already exists. Use PUT /templates/:id to create a new version.`,
      );
    }

    return this.prisma.emailTemplate.create({
      data: {
        templateName: dto.templateName,
        templateSlug: dto.templateSlug,
        version: 1,
        isLatest: true,
        subject: dto.subject ?? null,
        template: dto.template,
        status: dto.status,
      },
    });
  }

  async updateTemplateVersion(id: number, dto: UpdateTemplateDto) {
    const current = await this.prisma.emailTemplate.findUnique({
      where: { templateId: BigInt(id) },
    });
    if (!current) throw new NotFoundException(`Template #${id} not found`);

    return this.prisma.$transaction(async (tx) => {
      await tx.emailTemplate.updateMany({
        where: { templateSlug: current.templateSlug },
        data: { isLatest: false },
      });

      return tx.emailTemplate.create({
        data: {
          templateName: dto.templateName ?? current.templateName,
          templateSlug: current.templateSlug,
          version: current.version + 1,
          isLatest: true,
          subject: dto.subject !== undefined ? dto.subject : current.subject,
          template: dto.template ?? current.template,
          status: dto.status !== undefined ? dto.status : current.status,
        },
      });
    });
  }

  async updateTemplateStatus(id: number, status: boolean) {
    const tmpl = await this.prisma.emailTemplate.findUnique({
      where: { templateId: BigInt(id) },
    });
    if (!tmpl) throw new NotFoundException(`Template #${id} not found`);

    return this.prisma.emailTemplate.update({
      where: { templateId: BigInt(id) },
      data: { status },
    });
  }

  async previewTemplate(id: number, data: Record<string, string>) {
    const tmpl = await this.prisma.emailTemplate.findUnique({
      where: { templateId: BigInt(id) },
    });
    if (!tmpl) throw new NotFoundException(`Template #${id} not found`);

    const rendered = this.renderTemplate(tmpl, data);
    const expectedVariables = this.extractTemplatePlaceholders(
      (tmpl.subject ?? '') + ' ' + tmpl.template,
    );
    const missingVariables = expectedVariables.filter((v) => !(v in data));

    return {
      templateId: tmpl.templateId.toString(),
      templateSlug: tmpl.templateSlug,
      version: tmpl.version,
      subject: rendered.subject,
      html: rendered.html,
      expectedVariables,
      missingVariables,
    };
  }

  async findTemplateBySlug(slug: string) {
    const tmpl = await this.prisma.emailTemplate.findFirst({
      where: { templateSlug: slug, isLatest: true },
    });
    if (!tmpl)
      throw new NotFoundException(`No active template found for slug "${slug}"`);
    return tmpl;
  }

  async findTemplateVersions(slug: string) {
    const versions = await this.prisma.emailTemplate.findMany({
      where: { templateSlug: slug },
      orderBy: { version: 'desc' },
    });
    if (!versions.length)
      throw new NotFoundException(`No template found for slug "${slug}"`);
    return versions;
  }

  async findAllTemplates() {
    // Returns only the latest version of each template
    return this.prisma.emailTemplate.findMany({
      where: { isLatest: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplateById(id: number) {
    const tmpl = await this.prisma.emailTemplate.findUnique({
      where: { templateId: BigInt(id) },
    });
    if (!tmpl) throw new NotFoundException(`Template #${id} not found`);
    return tmpl;
  }


  async createConfig(dto: CreateConfigDto) {
    return this.prisma.notificationServiceConfig.create({
      data: {
        channelType: dto.channelType as any,
        providerName: dto.providerName,
        providerHost: dto.providerHost ?? null,
        providerPort: dto.providerPort ?? null,
        clientId: dto.clientId ?? null,
        clientSecretKey: dto.clientSecretKey ?? null,
        status: dto.status,
      },
    });
  }

  async findAllConfigs() {
    return this.prisma.notificationServiceConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }


  async findAllLogs() {
    return this.prisma.emailLog.findMany({
      include: { template: true, config: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findLogById(id: number) {
    const log = await this.prisma.emailLog.findUnique({
      where: { emailLogId: BigInt(id) },
      include: { template: true, config: true },
    });
    if (!log) throw new NotFoundException(`Log #${id} not found`);
    return log;
  }

  private extractTemplatePlaceholders(source: string): string[] {
    // Matches all {{ variableName }} placeholders (with optional surrounding whitespace)
    // and returns a deduplicated list of variable names found in the template source.
    const templatePlaceholders = source.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
    return [...new Set([...templatePlaceholders].map((m) => m[1]))];
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

  private async writeLog(
    dto: SendNotificationDto,
    status: 'sent' | 'failed',
  ) {
    return this.prisma.emailLog.create({
      data: {
        recipient: dto.recipient,
        templateId: BigInt(dto.templateId),
        configId: BigInt(dto.configId),
        data: JSON.stringify(dto.data),
        status: status as any,
        sentAt: status === 'sent' ? new Date() : null,
      },
    });
  }

  async writeAuditLog(
    transactionId: string,
    event: 'created' | 'processing' | 'sent' | 'failed' | 'retrying',
    detail?: string,
  ) {
    return this.prisma.notificationAuditLog.create({
      data: { transactionId, event: event as any, detail: detail ?? null },
    });
  }
}

  
