import { ApiProperty } from "@nestjs/swagger";

export class DatasetResponseDto {
  @ApiProperty({
    description: "Unique identifier of the created dataset",
    example: "uuid-here",
  })
  id: string;

  @ApiProperty({
    description: "Success message",
    example: "Dataset created successfully",
  })
  message: string;
}

export class EmbeddingModelDto {
  @ApiProperty({ example: "emb-001" })
  id: string;

  @ApiProperty({ example: "text-embedding-3-small" })
  name: string;
}

export class ChunkingMethodDto {
  @ApiProperty({ example: "naive" })
  id: string;

  @ApiProperty({ example: "Naive" })
  label: string;
}

export class PipelineDto {
  @ApiProperty({ example: "pipeline-uuid-here" })
  id: string;

  @ApiProperty({ example: "My Pipeline" })
  name: string;
}

export class DatasetListItemDto {
  @ApiProperty({ example: "uuid-here" })
  id: string;

  @ApiProperty({ example: "My Dataset" })
  name: string;

  @ApiProperty({ example: 0 })
  fileCount: number;

  @ApiProperty({ example: "2026-07-15T10:00:00.000Z" })
  createdAt: string;
}

export class PaginatedDatasetResponseDto {
  @ApiProperty({ type: [DatasetListItemDto] })
  items: DatasetListItemDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
