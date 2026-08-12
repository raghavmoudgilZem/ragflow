import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { mockChunks } from './mock';

@Injectable()
export class DatasetService {
  private readonly logger = new Logger(DatasetService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /*
   * Fetches the completion from the dataset service. This is the main service
   * This is called when we search any query.
   * This api will be called after the authentication.
   */

  async retrieveContext(
    query: string,
    kbIds: string,
    threshold: number,
    tenantId: string,
    searchId: string,
  ) {
    const baseUrl = this.configService.get<string>('DATASET_SERVICE_URL');

    if (!baseUrl) {
      this.logger.error('DATASET_SERVICE_URL not defined in the environment');
      throw new HttpException(
        'Internal Server Error: Service configuration missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const datasetIds = kbIds ? kbIds.split(',') : [];

    const body = {
      highlight: true,
      question: query,
      page: 1,
      size: 50,
      search_id: searchId,
      tenant_id: tenantId,
      dataset_ids: datasetIds,
      threshold,
    };

    try {
      const url = `${baseUrl}/v1/datasets/search`;

      const response = await firstValueFrom(this.httpService.post(url, body));

      return response.data?.data?.chunks || [];
    } catch (error: any) {
      this.logger.error(
        `Failed to retrieve the context from dataset service: ${error.message}`,
      );

      if (error.response) {
        throw new HttpException(
          error.response?.data?.message || 'Dataset Service error',
          error.response.status,
        );
      }

      throw new HttpException(
        'Dataset service is currently unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Mock method to simulate dataset search results for testing.
   * Returns sample chunks as specified in README.md.
   */
  async mockRetrieveContext(
    query: string,
    kbIds: string,
    threshold: number,
    tenantId: string,
    searchId: string,
  ) {
    this.logger.log(`Using mock dataset search for query: "${query}"`);

    // Simulating a small network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockChunks.data;
  }
}
