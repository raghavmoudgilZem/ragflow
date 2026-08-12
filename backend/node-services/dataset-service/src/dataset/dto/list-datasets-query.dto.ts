import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsDateString,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export type DatasetStatusFilter = "active" | "processing" | "empty";

export class ListDatasetsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @ApiPropertyOptional({
    description: "Case-insensitive search by dataset name",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "ISO date string — created on or after this date",
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: "ISO date string — created on or before this date",
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minFileCount?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxFileCount?: number;

  @ApiPropertyOptional({ enum: ["active", "processing", "empty"] })
  @IsOptional()
  @IsEnum(["active", "processing", "empty"], {
    message:
      "status must be one of the following values: active, processing, empty",
  })
  status?: DatasetStatusFilter;

  @ApiPropertyOptional({ description: "Matches embd_id exactly" })
  @IsOptional()
  @IsString()
  embeddingModel?: string;
}
