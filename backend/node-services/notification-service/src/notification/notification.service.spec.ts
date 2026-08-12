import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EMAIL_PROVIDER } from './providers/email-provider.interface';
import { NOTIFICATION_QUEUE } from './queues/notification.queue';
import { NotificationChannel } from './dto/queue-notification.dto';

const TEMPLATE = {
  templateId: BigInt(1),
  templateName: 'Welcome',
  templateSlug: 'welcome_onboarding_v1',
  version: 1,
  isLatest: true,
  subject: 'Hello {{ first_name }}',
  template: '<p>Hi {{ first_name }}, verify at {{ verification_link }}</p>',
  status: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CONFIG = {
  configId: BigInt(10),
  channelType: 'EMAIL',
  providerName: 'sendgrid',
  providerHost: null,
  providerPort: null,
  clientId: null,
  clientSecretKey: null,
  status: true,
  createdAt: new Date(),
  updatedAt: null,
};

const EMAIL_LOG = {
  emailLogId: BigInt(100),
  recipient: 'user@example.com',
  templateId: BigInt(1),
  configId: BigInt(10),
  data: '{}',
  status: 'sent',
  createdAt: new Date(),
  sentAt: new Date(),
  updatedAt: null,
};

const NOTIFICATION_JOB_ROW = {
  jobId: BigInt(5),
  transactionId: 'test-txn-uuid-1234',
  bullJobId: null,
  recipient: 'user@example.com',
  channel: 'EMAIL',
  templateSlug: 'welcome_onboarding_v1',
  templateId: BigInt(1),
  data: '{}',
  sourceService: null,
  correlationId: null,
  status: 'queued',
  errorMessage: null,
  createdAt: new Date(),
  processedAt: null,
  updatedAt: null,
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  emailTemplate: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),

  notificationServiceConfig: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  emailLog: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  notificationJob: {
    create: jest.fn(),
    update: jest.fn(),
  },
  notificationAuditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockEmailProvider = {
  sendEmail: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EMAIL_PROVIDER, useValue: mockEmailProvider },
        { provide: getQueueToken(NOTIFICATION_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  // ── queueNotification ──────────────────────────────────────────────────────

  describe('queueNotification', () => {
    const dto = {
      recipient: 'user@example.com',
      channel: NotificationChannel.EMAIL,
      template_id: 'welcome_onboarding_v1',
      data: { first_name: 'Alex' },
    };

    it('enqueues a job and returns queued status', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(TEMPLATE);
      mockPrisma.notificationJob.create.mockResolvedValue(NOTIFICATION_JOB_ROW);
      mockPrisma.notificationAuditLog.create.mockResolvedValue({});
      mockQueue.add.mockResolvedValue({ id: '99' });
      mockPrisma.notificationJob.update.mockResolvedValue({
        ...NOTIFICATION_JOB_ROW,
        bullJobId: '99',
      });

      const result = await service.queueNotification(dto);

      expect(mockPrisma.emailTemplate.findFirst).toHaveBeenCalledWith({
        where: { templateSlug: dto.template_id, isLatest: true },
        select: { templateId: true, status: true },
      });
      expect(mockPrisma.notificationJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipient: dto.recipient,
            channel: 'EMAIL',
            templateSlug: dto.template_id,
          }),
        }),
      );
      expect(mockPrisma.notificationAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: 'created' }),
        }),
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send',
        expect.objectContaining({ transactionId: NOTIFICATION_JOB_ROW.transactionId ?? expect.any(String) }),
        expect.objectContaining({ attempts: 3 }),
      );
      expect(result.status).toBe('queued');
      expect(result.bullJobId).toBe('99');
      expect(result.recipient).toBe(dto.recipient);
    });

    it('throws NotFoundException when template slug does not exist', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(null);

      await expect(service.queueNotification(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when template is inactive', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        ...TEMPLATE,
        status: false,
      });

      await expect(service.queueNotification(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  // ── sendNotification ───────────────────────────────────────────────────────

  describe('sendNotification', () => {
    const dto = {
      recipient: 'user@example.com',
      configId: 10,
      templateId: 1,
      data: { first_name: 'Alex', verification_link: 'https://link.com/verify' },
    };

    it('sends an email and returns sent status with transactionId and logId', async () => {
      mockPrisma.notificationServiceConfig.findUnique.mockResolvedValue(CONFIG);
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);
      mockPrisma.notificationJob.create.mockResolvedValue(NOTIFICATION_JOB_ROW);
      mockPrisma.notificationAuditLog.create.mockResolvedValue({});
      mockEmailProvider.sendEmail.mockResolvedValue({
        messageId: 'msg-abc-123',
        status: 'sent',
        statusCode: 202,
      });
      mockPrisma.notificationJob.update.mockResolvedValue({
        ...NOTIFICATION_JOB_ROW,
        status: 'sent',
      });
      mockPrisma.emailLog.create.mockResolvedValue(EMAIL_LOG);

      const result = await service.sendNotification(dto);

      // job row created with correct fields
      expect(mockPrisma.notificationJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipient: dto.recipient,
            channel: 'EMAIL',
            templateSlug: TEMPLATE.templateSlug,
            status: 'processing',
          }),
        }),
      );
      // initial audit log written
      expect(mockPrisma.notificationAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: 'created' }),
        }),
      );
      // provider called with correct payload including transactionId in metadata
      expect(mockEmailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: dto.recipient,
          subject: 'Hello Alex',
          html: '<p>Hi Alex, verify at https://link.com/verify</p>',
          metadata: expect.objectContaining({
            transactionId: NOTIFICATION_JOB_ROW.transactionId,
          }),
        }),
      );
      // job updated to sent
      expect(mockPrisma.notificationJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'sent' }),
        }),
      );
      // sent audit log written
      expect(mockPrisma.notificationAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: 'sent' }),
        }),
      );
      expect(result.transactionId).toBe(NOTIFICATION_JOB_ROW.transactionId);
      expect(result.status).toBe('sent');
      expect(result.messageId).toBe('msg-abc-123');
      expect(result.logId).toBe('100');
      expect(result.recipient).toBe(dto.recipient);
    });

    it('throws NotFoundException when config does not exist', async () => {
      mockPrisma.notificationServiceConfig.findUnique.mockResolvedValue(null);

      await expect(service.sendNotification(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEmailProvider.sendEmail).not.toHaveBeenCalled();
      expect(mockPrisma.notificationJob.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when config is disabled', async () => {
      mockPrisma.notificationServiceConfig.findUnique.mockResolvedValue({
        ...CONFIG,
        status: false,
      });

      await expect(service.sendNotification(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockEmailProvider.sendEmail).not.toHaveBeenCalled();
      expect(mockPrisma.notificationJob.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when template does not exist', async () => {
      mockPrisma.notificationServiceConfig.findUnique.mockResolvedValue(CONFIG);
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.sendNotification(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEmailProvider.sendEmail).not.toHaveBeenCalled();
      expect(mockPrisma.notificationJob.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when template is inactive', async () => {
      mockPrisma.notificationServiceConfig.findUnique.mockResolvedValue(CONFIG);
      mockPrisma.emailTemplate.findUnique.mockResolvedValue({
        ...TEMPLATE,
        status: false,
      });

      await expect(service.sendNotification(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockEmailProvider.sendEmail).not.toHaveBeenCalled();
      expect(mockPrisma.notificationJob.create).not.toHaveBeenCalled();
    });

    it('marks job as failed, writes failed audit log, and re-throws when provider throws', async () => {
      mockPrisma.notificationServiceConfig.findUnique.mockResolvedValue(CONFIG);
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);
      mockPrisma.notificationJob.create.mockResolvedValue(NOTIFICATION_JOB_ROW);
      mockPrisma.notificationAuditLog.create.mockResolvedValue({});
      mockEmailProvider.sendEmail.mockRejectedValue(
        new Error('SendGrid unavailable'),
      );
      mockPrisma.notificationJob.update.mockResolvedValue({
        ...NOTIFICATION_JOB_ROW,
        status: 'failed',
      });
      mockPrisma.emailLog.create.mockResolvedValue({
        ...EMAIL_LOG,
        status: 'failed',
        sentAt: null,
      });

      await expect(service.sendNotification(dto)).rejects.toThrow(
        'SendGrid unavailable',
      );
      // job updated to failed
      expect(mockPrisma.notificationJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'failed',
            errorMessage: 'SendGrid unavailable',
          }),
        }),
      );
      // failed audit log written
      expect(mockPrisma.notificationAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: 'failed' }),
        }),
      );
      // email log also written
      expect(mockPrisma.emailLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'failed' }),
        }),
      );
    });
  });

  // ── createTemplate ─────────────────────────────────────────────────────────

  describe('createTemplate', () => {
    const dto = {
      templateName: 'Welcome',
      templateSlug: 'welcome_onboarding_v1',
      subject: 'Hello',
      template: '<p>Hi</p>',
      status: true,
    };

    it('creates version 1 template when slug is new', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(null);
      mockPrisma.emailTemplate.create.mockResolvedValue(TEMPLATE);

      const result = await service.createTemplate(dto);

      expect(mockPrisma.emailTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            templateName: dto.templateName,
            templateSlug: dto.templateSlug,
            version: 1,
            isLatest: true,
          }),
        }),
      );
      expect(result).toEqual(TEMPLATE);
    });

    it('throws BadRequestException when slug already exists', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(TEMPLATE);

      await expect(service.createTemplate(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.emailTemplate.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTemplateVersion', () => {
    const updateDto = { subject: 'Updated Subject', template: '<p>New body</p>' };
    const newVersion = { ...TEMPLATE, templateId: BigInt(2), version: 2 };

    it('creates a new version and marks old as not latest', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);
      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          emailTemplate: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            create: jest.fn().mockResolvedValue(newVersion),
          },
        }),
      );

      const result = await service.updateTemplateVersion(1, updateDto);

      expect(result.version).toBe(2);
    });

    it('throws NotFoundException when template does not exist', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.updateTemplateVersion(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTemplateStatus', () => {
    it('updates and returns the template with new status', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);
      mockPrisma.emailTemplate.update.mockResolvedValue({ ...TEMPLATE, status: false });

      const result = await service.updateTemplateStatus(1, false);

      expect(mockPrisma.emailTemplate.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: false } }),
      );
      expect(result.status).toBe(false);
    });

    it('throws NotFoundException when template does not exist', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.updateTemplateStatus(999, true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('previewTemplate', () => {
    it('returns rendered output and variable analysis', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);

      const result = await service.previewTemplate(1, {
        first_name: 'Alex',
        verification_link: 'https://link.com/verify',
      });

      expect(result.subject).toBe('Hello Alex');
      expect(result.html).toBe('<p>Hi Alex, verify at https://link.com/verify</p>');
      expect(result.expectedVariables).toEqual(
        expect.arrayContaining(['first_name', 'verification_link']),
      );
      expect(result.missingVariables).toHaveLength(0);
      expect(result.version).toBe(1);
    });

    it('lists missing variables when data is incomplete', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);

      const result = await service.previewTemplate(1, { first_name: 'Alex' });

      expect(result.missingVariables).toContain('verification_link');
    });

    it('throws NotFoundException when template does not exist', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.previewTemplate(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findTemplateBySlug', () => {
    it('returns the latest active template for a slug', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(TEMPLATE);

      const result = await service.findTemplateBySlug('welcome_onboarding_v1');

      expect(mockPrisma.emailTemplate.findFirst).toHaveBeenCalledWith({
        where: { templateSlug: 'welcome_onboarding_v1', isLatest: true },
      });
      expect(result).toEqual(TEMPLATE);
    });

    it('throws NotFoundException when no template found for slug', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(null);

      await expect(
        service.findTemplateBySlug('unknown_slug'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTemplateVersions', () => {
    it('returns all versions ordered newest first', async () => {
      const v2 = { ...TEMPLATE, templateId: BigInt(2), version: 2, isLatest: true };
      const v1 = { ...TEMPLATE, isLatest: false };
      mockPrisma.emailTemplate.findMany.mockResolvedValue([v2, v1]);

      const result = await service.findTemplateVersions('welcome_onboarding_v1');

      expect(mockPrisma.emailTemplate.findMany).toHaveBeenCalledWith({
        where: { templateSlug: 'welcome_onboarding_v1' },
        orderBy: { version: 'desc' },
      });
      expect(result[0].version).toBe(2);
      expect(result).toHaveLength(2);
    });

    it('throws NotFoundException when slug has no versions', async () => {
      mockPrisma.emailTemplate.findMany.mockResolvedValue([]);

      await expect(
        service.findTemplateVersions('unknown_slug'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── findAllTemplates ───────────────────────────────────────────────────────

  describe('findAllTemplates', () => {
    it('returns only latest versions ordered by createdAt desc', async () => {
      mockPrisma.emailTemplate.findMany.mockResolvedValue([TEMPLATE]);

      const result = await service.findAllTemplates();

      expect(mockPrisma.emailTemplate.findMany).toHaveBeenCalledWith({
        where: { isLatest: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  // ── findTemplateById ───────────────────────────────────────────────────────

  describe('findTemplateById', () => {
    it('returns the template when found', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(TEMPLATE);

      const result = await service.findTemplateById(1);

      expect(result).toEqual(TEMPLATE);
    });

    it('throws NotFoundException when template is not found', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findTemplateById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── createConfig ───────────────────────────────────────────────────────────

  describe('createConfig', () => {
    it('creates and returns a config', async () => {
      mockPrisma.notificationServiceConfig.create.mockResolvedValue(CONFIG);

      const dto = {
        channelType: 'EMAIL' as any,
        providerName: 'sendgrid',
        status: true,
      };

      const result = await service.createConfig(dto);

      expect(mockPrisma.notificationServiceConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ providerName: 'sendgrid' }),
        }),
      );
      expect(result).toEqual(CONFIG);
    });
  });

  // ── findAllConfigs ─────────────────────────────────────────────────────────

  describe('findAllConfigs', () => {
    it('returns all configs', async () => {
      mockPrisma.notificationServiceConfig.findMany.mockResolvedValue([CONFIG]);

      const result = await service.findAllConfigs();

      expect(result).toHaveLength(1);
    });
  });

  // ── findAllLogs ────────────────────────────────────────────────────────────

  describe('findAllLogs', () => {
    it('returns up to 100 logs with relations', async () => {
      mockPrisma.emailLog.findMany.mockResolvedValue([EMAIL_LOG]);

      const result = await service.findAllLogs();

      expect(mockPrisma.emailLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { template: true, config: true },
          take: 100,
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  // ── findLogById ────────────────────────────────────────────────────────────

  describe('findLogById', () => {
    it('returns the log when found', async () => {
      mockPrisma.emailLog.findUnique.mockResolvedValue(EMAIL_LOG);

      const result = await service.findLogById(100);

      expect(result).toEqual(EMAIL_LOG);
    });

    it('throws NotFoundException when log is not found', async () => {
      mockPrisma.emailLog.findUnique.mockResolvedValue(null);

      await expect(service.findLogById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
