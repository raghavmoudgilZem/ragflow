import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    example: 'document.pdf',
  })
  name: string;

  @ApiProperty({
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    example: 102400,
  })
  sizeBytes: number;
}

export class UploadFailureDto {
  @ApiProperty({
    example: 'document.pdf',
  })
  fileName: string;

  @ApiProperty({
    example: 'A file or folder with the same name already exists',
  })
  reason: string;
}

export class UploadFilesResponseDto {
  @ApiProperty({
    type: UploadedFileDto,
    isArray: true,
  })
  successful: UploadedFileDto[];

  @ApiProperty({
    type: UploadFailureDto,
    isArray: true,
  })
  failed: UploadFailureDto[];
}
