import { IsObject, IsString } from 'class-validator';

export class CompletionResponseDto {
  @IsString()
  provider: string;

  @IsObject()
  data: Record<string, unknown>;
}
