import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ChannelTypeDto {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export class CreateConfigDto {
  @IsEnum(ChannelTypeDto)
  channelType: ChannelTypeDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  providerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerHost?: string;

  @IsOptional()
  @IsInt()
  providerPort?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  clientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  clientSecretKey?: string;

  @IsBoolean()
  status: boolean;
}
