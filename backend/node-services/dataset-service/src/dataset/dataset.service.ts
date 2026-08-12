import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, timeout } from "rxjs";
import { AxiosResponse } from "axios";
import { PrismaService } from "../infrastructure/database/prisma.service";
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

@Injectable()
export class DatasetService {
  private readonly logger = new Logger(DatasetService.name);
  private readonly IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL;
  private readonly AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL;
  private readonly TIMEOUT_MS = 2000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  // ── Embedding Models ──────────────────────────────────────────────────────
  async getEmbeddingModels(): Promise<EmbeddingModelDto[]> {
    try {
      const response: AxiosResponse<EmbeddingModelDto[]> = await firstValueFrom(
        this.httpService
          .get<
            EmbeddingModelDto[]
          >(`${this.IDENTITY_SERVICE_URL}/embedding-models`)
          .pipe(timeout(this.TIMEOUT_MS)),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Identity service call failed/timed out: ${(error as Error).message}. Using fallback data.`,
      );
      return this.getFallbackEmbeddingModels();
    }
  }

  // ── Chunking Methods ──────────────────────────────────────────────────────
  async getChunkingMethods(): Promise<ChunkingMethodDto[]> {
    return [
      { id: "naive", label: "Naive" },
      { id: "delimiter", label: "Delimiter" },
      { id: "smart", label: "Smart" },
      { id: "qa", label: "Q&A" },
      { id: "resume", label: "Resume" },
      { id: "manual", label: "Manual" },
      { id: "table", label: "Table" },
      { id: "picture", label: "Picture" },
      { id: "one", label: "One" },
      { id: "knowledge-graph", label: "Knowledge Graph" },
    ];
  }

  // ── Pipelines ─────────────────────────────────────────────────────────────
  async getPipelines(): Promise<PipelineDto[]> {
    try {
      const response: AxiosResponse<PipelineDto[]> = await firstValueFrom(
        this.httpService
          .get<PipelineDto[]>(`${this.AGENT_SERVICE_URL}/pipelines`)
          .pipe(timeout(this.TIMEOUT_MS)),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Agent service call failed/timed out: ${(error as Error).message}. Using fallback data.`,
      );
      return this.getFallbackPipelines();
    }
  }

  // ── Create Dataset ────────────────────────────────────────────────────────
  async createDataset(
    dto: CreateDatasetDto,
    userId: string,
    tenantId: string,
  ): Promise<DatasetResponseDto> {
    try {
      // Service-level safety check
      if (dto.parseType === "built-in" && !dto.chunkingMethod) {
        throw new ConflictException(
          "chunkingMethod is required for built-in parse type",
        );
      }
      if (dto.parseType === "pipeline" && !dto.pipelineId) {
        throw new ConflictException(
          "pipelineId is required for pipeline parse type",
        );
      }

      // Check duplicate name
      const existing = await this.prisma.dataset.findFirst({
        where: { name: dto.name, tenantId, status: "1" },
      });
      if (existing) {
        throw new ConflictException(
          `A dataset with the name "${dto.name}" already exists`,
        );
      }

      // Create dataset
      const dataset = await this.prisma.dataset.create({
        data: {
          tenantId,
          name: dto.name,
          embdId: dto.embeddingModel,
          tenantEmbdId: "",
          createdBy: userId,
          pipelineId: dto.pipelineId ?? null,
          status: "1",
        },
      });

      return {
        id: dataset.id,
        message: "Dataset created successfully",
      };
    } catch (error) {
      this.handleUnexpectedError("createDataset", error);
    }
  }

  // ── Get Datasets ────────────────────────────────────────────────────────
  async getDatasets(
    userId: string,
    query: ListDatasetsQueryDto,
  ): Promise<PaginatedDatasetResponseDto> {
    try {
      const {
        page,
        pageSize,
        search,
        createdFrom,
        createdTo,
        minFileCount,
        maxFileCount,
        status,
        embeddingModel,
      } = query;

      const where: any = {
        createdBy: userId,
        status: "1",
      };

      if (search) {
        where.name = { contains: search };
      }

      if (createdFrom || createdTo) {
        where.createdAt = {
          ...(createdFrom && { gte: new Date(createdFrom) }),
          ...(createdTo && { lte: new Date(`${createdTo}T23:59:59.999Z`) }),
        };
      }

      if (minFileCount !== undefined || maxFileCount !== undefined) {
        // where.fileCount = {
        //   ...(minFileCount !== undefined && { gte: minFileCount }),
        //   ...(maxFileCount !== undefined && { lte: maxFileCount }),
        // };
        this.logger.warn(
          "minFileCount/maxFileCount filter requested but not yet supported (fileCount is not a queryable field)",
        );
      }

      if (status === "processing" || status === "empty") {
        where.id = "__no_match__";
      }

      if (embeddingModel) {
        where.embdId = embeddingModel;
      }

      const [datasets, total] = await Promise.all([
        this.prisma.dataset.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.dataset.count({ where }),
      ]);

      return {
        items: datasets.map((d) => ({
          id: d.id,
          name: d.name,
          fileCount: 0,
          createdAt: d.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 0,
      };
    } catch (error) {
      this.handleUnexpectedError("getDatasets", error);
    }
  }

  // ── Rename Datasets ────────────────────────────────────────────────────────
  async rename(id: string, dto: RenameDatasetDto, userId: string) {
    try {
      const dataset = await this.prisma.dataset.findUnique({ where: { id } });

      if (!dataset || dataset.status === "0") {
        throw new NotFoundException("Dataset not found");
      }

      if (dataset.createdBy !== userId) {
        throw new ForbiddenException(
          "You do not have permission to rename this dataset",
        );
      }

      if (dataset.name === dto.name) {
        throw new ConflictException(
          "New name is the same as the current dataset name",
        );
      }

      const duplicate = await this.prisma.dataset.findFirst({
        where: {
          name: dto.name,
          createdBy: userId,
          status: "1",
        },
      });

      if (duplicate) {
        throw new ConflictException("A dataset with this name already exists");
      }

      const updated = await this.prisma.dataset.update({
        where: { id },
        data: { name: dto.name },
      });

      return {
        id: updated.id,
        name: updated.name,
        message: "Dataset renamed successfully",
      };
    } catch (error) {
      this.handleUnexpectedError("rename", error);
    }
  }

  // ── Delete Dataset (soft delete) ──────────────────────────────────────────
  async delete(id: string, userId: string) {
    try {
      const dataset = await this.prisma.dataset.findUnique({ where: { id } });

      if (!dataset || dataset.status === "0") {
        throw new NotFoundException("Dataset not found");
      }

      if (dataset.createdBy !== userId) {
        throw new ForbiddenException(
          "You do not have permission to delete this dataset",
        );
      }

      await this.prisma.dataset.update({
        where: { id },
        data: { status: "0" },
      });

      return {
        id,
        message: "Dataset deleted successfully",
      };
    } catch (error) {
      this.handleUnexpectedError("delete", error);
    }
  }

  // ── Fallback data ─────────────────────────────────────────────────────────
  private getFallbackEmbeddingModels(): EmbeddingModelDto[] {
    return [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "text-embedding-3-small",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "text-embedding-3-large",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "text-embedding-ada-002",
      },
    ];
  }

  private getFallbackPipelines(): PipelineDto[] {
    return [
      { id: "660e8400-e29b-41d4-a716-446655440001", name: "Default Pipeline" },
      { id: "660e8400-e29b-41d4-a716-446655440002", name: "Advanced Pipeline" },
    ];
  }

  private handleUnexpectedError(context: string, error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(
      `${context} failed: ${error instanceof Error ? error.message : String(error)}`,
      error,
    );

    throw new InternalServerErrorException(
      "Something went wrong. Please try again.",
    );
  }
}
