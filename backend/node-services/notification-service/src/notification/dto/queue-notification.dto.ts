import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export class NotificationMetadataDto {
  @IsOptional()
  @IsString()
  source_service?: string;

  @IsOptional()
  @IsString()
  correlation_id?: string;
}

export class QueueNotificationDto {
  @IsEmail({}, { message: 'recipient must be a valid email address' })
  recipient: string;

  @IsEnum(NotificationChannel, {
    message: 'channel must be one of: EMAIL, SMS',
  })
  channel: NotificationChannel;

  @IsString()
  @IsNotEmpty({ message: 'template_id must not be empty' })
  template_id: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: NotificationMetadataDto;
}
