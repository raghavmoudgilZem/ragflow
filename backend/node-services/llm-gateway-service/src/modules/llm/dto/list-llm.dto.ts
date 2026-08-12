import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListLlmDto {
  @IsOptional()
  @IsString()
  llm_name?: string;

  @IsOptional()
  @IsString()
  model_type?: string;

  @IsOptional()
  @IsString()
  factoryId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_tools?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
