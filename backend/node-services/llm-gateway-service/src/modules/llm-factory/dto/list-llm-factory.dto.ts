import { IsOptional, IsString, IsIn, IsEnum } from 'class-validator';
import { LLMStatus } from '@prisma/client';

export class ListLlmFactoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(LLMStatus)
  status?: LLMStatus;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortRank?: 'asc' | 'desc' = 'desc';
}
