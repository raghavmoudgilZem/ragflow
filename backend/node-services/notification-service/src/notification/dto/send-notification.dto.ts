import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class SendNotificationDto {
  @IsEmail({}, { message: 'recipient must be a valid email address' })
  recipient: string;

  @IsNumber()
  @IsPositive()
  configId: number;

  @IsNumber()
  @IsPositive()
  templateId: number;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, string>;
}
