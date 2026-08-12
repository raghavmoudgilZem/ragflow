import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSearchDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search_id?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tenant_id?: string;

  // Pass Object as a constructor type to satisfy TypeScript and Swagger
  @ApiProperty({
    required: false,
    type: () => Object, // OR simply use type: Object
    additionalProperties: true,
    description:
      'Dynamic configuration settings mapping directly to the database column',
  })
  @IsObject()
  @IsOptional()
  search_config?: Record<string, any>;
}
