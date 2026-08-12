import {
  IsArray,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchConfigDto {
  @ApiProperty({
    description:
      'Array of Knowledge Base identifiers utilized as context source',
    example: ['kb_finance_01', 'kb_hr_05'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true }) // Validates that every item inside the array is a string
  kb_ids!: string[];

  @ApiProperty({
    description: 'The similarity threshold cutoff for vector searching',
    example: 0.75,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold!: number;

  @ApiProperty({
    description:
      'The total number of context document chunks to return (Top N)',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  top_k!: number;

  @ApiProperty({
    description:
      'Configuration payload and hyperparameter metrics specifically for the target LLM provider',
    example: { model: 'gpt-4o', temperature: 0.2 },
  })
  @IsObject()
  @IsNotEmpty()
  llm_setting!: Record<string, any>; // Swapped 'any' for a structurally typed object definition
}
