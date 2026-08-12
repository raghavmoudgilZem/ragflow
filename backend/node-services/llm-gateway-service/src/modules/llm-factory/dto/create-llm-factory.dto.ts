import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { LLMStatus } from '@prisma/client';
export class CreateLlmFactoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsString()
  @IsNotEmpty()
  tags: string;

  @IsEnum(LLMStatus)
  status: LLMStatus;

  @IsInt()
  @Min(0)
  rank: number;
}
