import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    example: 'project-documents',
    description: 'Folder name',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Matches(/^[^\\/:*?"<>|]+$/, {
    message: 'Folder name contains invalid characters',
  })
  name: string;

  @ApiPropertyOptional({
    example: '5551a6bd-7c1d-11f1-b3a5-76d017067fac',
    nullable: true,
    description: 'Parent folder id',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
