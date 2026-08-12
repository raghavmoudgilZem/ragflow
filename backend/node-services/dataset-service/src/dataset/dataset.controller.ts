import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Delete,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from "@nestjs/swagger";
import { Request } from "express";

import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

import { DatasetService } from "./dataset.service";

import {
  CreateDatasetDto,
  RenameDatasetDto,
  ListDatasetsQueryDto,
  DatasetResponseDto,
  EmbeddingModelDto,
  ChunkingMethodDto,
  PipelineDto,
  PaginatedDatasetResponseDto,
} from "./dto";

@ApiTags("datasets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("datasets")
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Get("embedding-models")
  @ApiOperation({ summary: "Get available embedding models" })
  @ApiResponse({ status: 200, type: [EmbeddingModelDto] })
  async getEmbeddingModels(): Promise<EmbeddingModelDto[]> {
    return this.datasetService.getEmbeddingModels();
  }

  @Get("chunking-methods")
  @ApiOperation({ summary: "Get available chunking methods" })
  @ApiResponse({ status: 200, type: [ChunkingMethodDto] })
  async getChunkingMethods(): Promise<ChunkingMethodDto[]> {
    return this.datasetService.getChunkingMethods();
  }

  @Get("pipelines")
  @ApiOperation({ summary: "Get available pipelines" })
  @ApiResponse({ status: 200, type: [PipelineDto] })
  async getPipelines(): Promise<PipelineDto[]> {
    return this.datasetService.getPipelines();
  }

  @Get()
  @ApiOperation({
    summary:
      "Get all datasets with search, filter and pagination for the current user",
  })
  @ApiResponse({
    status: 200,
    description: "List of datasets",
    type: PaginatedDatasetResponseDto,
  })
  async getDatasets(
    @Query() query: ListDatasetsQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedDatasetResponseDto> {
    const user = req.user as { id: string; email: string; role: string };
    return this.datasetService.getDatasets(user.id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new dataset" })
  @ApiResponse({ status: 201, type: DatasetResponseDto })
  @ApiResponse({ status: 409, description: "Dataset name already exists" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createDataset(
    @Body() dto: CreateDatasetDto,
    @Req() req: Request,
  ): Promise<DatasetResponseDto> {
    const user = req.user as { id: string; email: string; role: string };
    return this.datasetService.createDataset(dto, user.id, user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Rename a dataset" })
  @ApiBody({ type: RenameDatasetDto })
  async rename(
    @Param("id") id: string,
    @Body() dto: RenameDatasetDto,
    @Req() req,
  ) {
    return this.datasetService.rename(id, dto, req.user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Soft-delete a dataset" })
  @ApiResponse({ status: 200, description: "Dataset deleted successfully" })
  @ApiResponse({ status: 403, description: "Not the owner of this dataset" })
  @ApiResponse({ status: 404, description: "Dataset not found" })
  async delete(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as { id: string; email: string; role: string };
    return this.datasetService.delete(id, user.id);
  }
}
