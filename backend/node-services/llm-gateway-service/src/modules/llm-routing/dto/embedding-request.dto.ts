import { IsNotEmpty, IsOptional, IsObject, IsString } from 'class-validator';

export class EmbeddingRequestDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  input: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
