import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  templateName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  templateSlug: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsBoolean()
  status: boolean;
}
