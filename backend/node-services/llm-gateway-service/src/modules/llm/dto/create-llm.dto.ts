import { IsString, IsNotEmpty, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateLlmDto {
  @IsString()
  @IsNotEmpty()
  llm_name: string;

  @IsString()
  @IsNotEmpty()
  tags: string;

  @IsInt()
  @Min(1)
  max_tokens: number;

  @IsString()
  @IsNotEmpty()
  model_type: string;

  @IsBoolean()
  is_tools: boolean;

  @IsString()
  @IsNotEmpty()
  factoryId: string;
}
