import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// 1. Define the enum for the document type
export enum DocumentType {
  PDF = 'pdf',
  WORD = 'word',
  DOCX = 'docx',
  PPT = 'ppt',
}

// 2. Define the nested options DTO
export class DocumentOptionsDto {
  @IsBoolean()
  @IsNotEmpty()
  ocr!: boolean;
}

// 3. Define the main DTO
export class CreateParserJobDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @IsString()
  @IsNotEmpty()
  documentPath!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type!: DocumentType;

  @IsObject()
  @ValidateNested()
  @Type(() => DocumentOptionsDto)
  @IsNotEmpty()
  options!: DocumentOptionsDto;
}
