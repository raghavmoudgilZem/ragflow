import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { QueueNotificationDto } from './dto/queue-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { PreviewTemplateDto } from './dto/preview-template.dto';
import { CreateConfigDto } from './dto/create-config.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  send(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(dto);
  }

  /** POST /api/v1/notifications — queue a notification for async processing */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  queue(@Body() dto: QueueNotificationDto) {
    return this.notificationService.queueNotification(dto);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationService.createTemplate(dto);
  }

  /** PUT /api/v1/notifications/templates/:id — create a new version of a template */
  @Put('templates/:id')
  updateTemplateVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.notificationService.updateTemplateVersion(id, dto);
  }

  /** PATCH /api/v1/notifications/templates/:id/status — toggle active/inactive */
  @Patch('templates/:id/status')
  updateTemplateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseBoolPipe) status: boolean,
  ) {
    return this.notificationService.updateTemplateStatus(id, status);
  }

  /** POST /api/v1/notifications/templates/:id/preview — test hydration without sending */
  @Post('templates/:id/preview')
  previewTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PreviewTemplateDto,
  ) {
    return this.notificationService.previewTemplate(id, dto.data);
  }

  /** GET /api/v1/notifications/templates */
  @Get('templates')
  findAllTemplates() {
    return this.notificationService.findAllTemplates();
  }

  /** GET /api/v1/notifications/templates/:id */
  @Get('templates/:id')
  findTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findTemplateById(id);
  }

  /** GET /api/v1/notifications/templates/slug/:slug — latest active version */
  @Get('templates/slug/:slug')
  findTemplateBySlug(@Param('slug') slug: string) {
    return this.notificationService.findTemplateBySlug(slug);
  }

  /** GET /api/v1/notifications/templates/slug/:slug/versions — all versions */
  @Get('templates/slug/:slug/versions')
  findTemplateVersions(@Param('slug') slug: string) {
    return this.notificationService.findTemplateVersions(slug);
  }

  /** POST /api/v1/notifications/configs */
  @Post('configs')
  @HttpCode(HttpStatus.CREATED)
  createConfig(@Body() dto: CreateConfigDto) {
    return this.notificationService.createConfig(dto);
  }

  /** GET /api/v1/notifications/configs */
  @Get('configs')
  findAllConfigs() {
    return this.notificationService.findAllConfigs();
  }

  /** GET /api/v1/notifications/logs */
  @Get('logs')
  findAllLogs() {
    return this.notificationService.findAllLogs();
  }

  /** GET /api/v1/notifications/logs/:id */
  @Get('logs/:id')
  findLog(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findLogById(id);
  }

  /** GET /api/v1/notifications/:transactionId — status + latest audit event */
  @Get(':transactionId')
  findTransaction(@Param('transactionId') transactionId: string) {
    return this.notificationService.findTransaction(transactionId);
  }

  /** GET /api/v1/notifications/:transactionId/audit — full audit trail */
  @Get(':transactionId/audit')
  findTransactionAudit(@Param('transactionId') transactionId: string) {
    return this.notificationService.findTransactionAudit(transactionId);
  }
}
