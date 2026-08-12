import { IsArray, IsString } from 'class-validator';

export class EmbeddingResponseDto {
  @IsString()
  provider: string;

  @IsArray()
  embedding: number[];
}
