import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  ValidateIf,
} from "class-validator";

export class CreateDatasetDto {
  @ApiProperty({
    description: "Name of the dataset",
    maxLength: 100,
    example: "My Knowledge Base",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: "Embedding model selected from the form",
    example: "embedding-uuid-here",
  })
  @IsString()
  @IsNotEmpty()
  embeddingModel: string;

  @ApiProperty({
    description: "Parse type — determines which field is required below",
    enum: ["built-in", "pipeline"],
    example: "built-in",
  })
  @IsEnum(["built-in", "pipeline"])
  parseType: "built-in" | "pipeline";

  @ApiPropertyOptional({
    description: "Required when parseType is built-in",
    example: "naive",
  })
  @ValidateIf((o) => o.parseType === "built-in")
  @IsString()
  @IsNotEmpty()
  chunkingMethod?: string;

  @ApiPropertyOptional({
    description: "Required when parseType is pipeline",
    example: "pipeline-uuid-here",
  })
  @ValidateIf((o) => o.parseType === "pipeline")
  @IsString()
  @IsNotEmpty()
  pipelineId?: string;
}
