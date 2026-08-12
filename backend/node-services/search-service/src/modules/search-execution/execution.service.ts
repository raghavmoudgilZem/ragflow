import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  HttpException, // <-- Import this to check for existing NestJS exceptions
} from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { DatasetService } from '../../integration/dataset-client/dataset.service';
import { LlmService } from '../../integration/llm-client/llm.service';
import { User } from '../../common/decorators/user.decorator';
import { SearchConfigDto } from './dto/search-config.dto';
import { defer, Observable, switchMap } from 'rxjs';
import { SearchExecutionPayloadDto } from './dto/searchExecution.dto';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly datasetService: DatasetService,
    private readonly llmService: LlmService,
  ) { }

  /**
   * Retrieves dataset chunks by relaying to the Dataset microservice.
   */
  async retrieveDatasetChunks(
    user: User,
    dto: SearchExecutionPayloadDto,
  ) {
    // Destructure the new payload, setting defaults for pagination
    const {
      question,
      search_id,
      page = 1,
      size = 10,
      dataset_ids
    } = dto;

    this.logger.log(
      `Relaying dataset search request for user ${user.userId} with search_id ${search_id} (Page: ${page}, Size: ${size})`,
    );

    try {
      // 1. Fetch the config using the new 'search_id'
      const config = await this.searchService.findOne(search_id, user);
      const searchConfig = config.search_config as unknown as SearchConfigDto;

      if (!searchConfig) {
        throw new InternalServerErrorException(
          'Search configuration not found or empty',
        );
      }

      // 2. Use dataset_ids from payload if provided, otherwise fallback to config kb_ids
      const kb_ids = dataset_ids && dataset_ids.length > 0
        ? dataset_ids
        : searchConfig.kb_ids;

      const threshold = searchConfig.threshold;
      const kbIdsString = Array.isArray(kb_ids)
        ? kb_ids.join(',')
        : kb_ids || '';

      // 3. Fetch mock data using the updated variables
      const mockData = await this.datasetService.mockRetrieveContext(
        question,      // Replaced 'query'
        kbIdsString,
        threshold,
        user.tenantId,
        search_id,     // Replaced 'configId'
      );

      // 4. Implement local pagination on the mock response chunks
      const safeChunks = mockData.chunks || [];
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedChunks = safeChunks.slice(startIndex, endIndex);

      return {
        code: 0,
        message: 'success',
        data: {
          chunks: paginatedChunks,
          doc_aggs: mockData.doc_aggs,
          pagination: {
            page,
            size,
            total: safeChunks.length,
          }
        },
      };
    } catch (error) {
      // 1. Log the error cleanly
      if (error instanceof Error) {
        this.logger.error(
          `Dataset retrieval failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Dataset retrieval failed: An unknown error occurred`);
      }

      // 2. If it's already a clean NestJS error (like 403 Forbidden from findOne), pass it through
      if (error instanceof HttpException) {
        throw error;
      }

      // 3. Otherwise, wrap raw crashes in a safe 500 error
      throw new InternalServerErrorException(
        'An error occurred while retrieving dataset chunks.',
      );
    }
  }

  executeSse(
    user: User,
    configId: string,
    question: string,
    dataset_ids?: string[],
    tenantIdOverride?: string,
  ): Observable<MessageEvent> {
    if (!user || !user.userId) {
      throw new BadRequestException(
        'Authenticated user profile context is missing.',
      );
    }

    this.logger.log(
      `Executing native streaming search for user ${user.userId} with config ${configId}`,
    );

    return defer(async () => {
      try {
        // Step A: Retrieve config
        const config = await this.searchService.findOne(configId, user);
        const searchConfig = config.search_config as unknown as SearchConfigDto;

        const { threshold, top_k } = searchConfig || {};

        // 1. OVERRIDE LOGIC: Use provided dataset_ids, otherwise fallback to config
        const kb_ids = dataset_ids && dataset_ids.length > 0
          ? dataset_ids
          : searchConfig.kb_ids;

        const kbIdsString = Array.isArray(kb_ids)
          ? kb_ids.join(',')
          : kb_ids || '';

        // 2. OVERRIDE LOGIC: Use provided tenantId, otherwise fallback to user token
        const finalTenantId = tenantIdOverride || user.tenantId;

        // Step B: Retrieve context
        const rawContext = await this.datasetService.mockRetrieveContext(
          question,      // Passing the updated question variable
          kbIdsString,
          threshold,
          finalTenantId, // Passing the computed tenantId
          configId,
        );

        const validatedContext = Array.isArray(rawContext)
          ? rawContext.slice(0, top_k)
          : [];

        return {
          query: question,
          context: validatedContext,
          settings: searchConfig,
        };
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`SSE Pipeline Setup Failed: ${error.message}`, error.stack);
        }

        if (error instanceof HttpException) {
          throw error;
        }

        throw new InternalServerErrorException('Failed to initialize streaming search pipeline.');
      }
    }).pipe(
      switchMap((payload) => {
        return this.llmService.mockProcessSseNative(payload);
      }),
    );
  }
}