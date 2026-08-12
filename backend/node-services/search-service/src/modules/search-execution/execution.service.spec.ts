import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionService } from './execution.service';
import { SearchService } from '../search/search.service';
import { DatasetService } from '../../integration/dataset-client/dataset.service';
import { LlmService } from '../../integration/llm-client/llm.service';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { of } from 'rxjs';
import { User } from '../../common/decorators/user.decorator';

describe('ExecutionService', () => {
    let service: ExecutionService;
    let searchService: jest.Mocked<SearchService>;
    let datasetService: jest.Mocked<DatasetService>;
    let llmService: jest.Mocked<LlmService>;

    // Mock User Object
    const mockUser: User = {
        userId: 'user-123',
        tenantId: 'tenant-abc',
    } as any;

    // Mock Search Config
    const mockSearchConfig = {
        kb_ids: ['kb1', 'kb2'],
        threshold: 0.7,
        top_k: 3,
        llm_setting: {},
    };

    const mockDatasetChunk = {
        chunk_id: 'chk-101',
        content_ltks: '',
        content_with_weight: 'This is the retrieved knowledge payload text context.',
        doc_id: 'doc-789',
        doc_type_kwd: '',
        docnm_kwd: 'financial_report_2026.pdf',
        image_id: '',
        important_kwd: [],
        kb_id: 'kb1',
        mom_id: '',
        positions: [],
        row_id: null,
        similarity: 0.89,
        tag_kwd: [],
        term_similarity: 0.8,
        vector_similarity: 0.92,
    };

    const mockConfigDbResult = {
        id: 'config-123',
        search_config: mockSearchConfig,
    };

    beforeEach(async () => {
        const mockSearchServiceFactory = () => ({
            findOne: jest.fn(),
        });

        const mockDatasetServiceFactory = () => ({
            mockRetrieveContext: jest.fn(),
        });

        const mockLlmServiceFactory = () => ({
            mockProcessSseNative: jest.fn(),
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExecutionService,
                { provide: SearchService, useFactory: mockSearchServiceFactory },
                { provide: DatasetService, useFactory: mockDatasetServiceFactory },
                { provide: LlmService, useFactory: mockLlmServiceFactory },
            ],
        }).compile();

        service = module.get<ExecutionService>(ExecutionService);
        searchService = module.get(SearchService);
        datasetService = module.get(DatasetService);
        llmService = module.get(LlmService);

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => jest.fn());
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => jest.fn());
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ==========================================
    // 1. Tests for retrieveDatasetChunks()
    // ==========================================
    describe('retrieveDatasetChunks', () => {
        // Updated to match SearchExecutionPayloadDto
        const mockDto = { question: 'test query', search_id: 'config-123', page: 1, size: 10 };

        it('should successfully retrieve dataset chunks and format paginated response', async () => {
            searchService.findOne.mockResolvedValue(mockConfigDbResult as any);

            // Mock now expects an object with 'chunks' and 'doc_aggs' based on new service logic
            datasetService.mockRetrieveContext.mockResolvedValue({
                chunks: [mockDatasetChunk, mockDatasetChunk],
                doc_aggs: [{ doc_id: 'doc-789', count: 2 }],
                labels: null,
                total: 2
            } as any);

            const result = await service.retrieveDatasetChunks(mockUser, mockDto);

            expect(searchService.findOne).toHaveBeenCalledWith('config-123', mockUser);
            expect(result).toEqual({
                code: 0,
                message: 'success',
                data: {
                    chunks: [mockDatasetChunk, mockDatasetChunk],
                    doc_aggs: [{ doc_id: 'doc-789', count: 2 }],
                    pagination: {
                        page: 1,
                        size: 10,
                        total: 2
                    }
                },
            });
        });

        it('should apply pagination slicing correctly', async () => {
            searchService.findOne.mockResolvedValue(mockConfigDbResult as any);
            datasetService.mockRetrieveContext.mockResolvedValue({
                chunks: [{ chunk_id: '1' }, { chunk_id: '2' }, { chunk_id: '3' }] as any[],
                doc_aggs: [],
                labels: null,
                total: 3
            } as any);

            // Request Page 2, Size 1
            const paginationDto = { ...mockDto, page: 2, size: 1 };
            const result = await service.retrieveDatasetChunks(mockUser, paginationDto);

            expect(result.data.chunks).toEqual([{ chunk_id: '2' }]);
            expect(result.data.pagination).toEqual({ page: 2, size: 1, total: 3 });
        });

        it('should override config kb_ids if dataset_ids are provided in payload', async () => {
            searchService.findOne.mockResolvedValue(mockConfigDbResult as any);
            datasetService.mockRetrieveContext.mockResolvedValue({
                chunks: [],
                doc_aggs: [],
                labels: null,
                total: 0
            } as any);

            const overrideDto = { ...mockDto, dataset_ids: ['custom-kb-99'] };
            await service.retrieveDatasetChunks(mockUser, overrideDto);

            expect(datasetService.mockRetrieveContext).toHaveBeenCalledWith(
                'test query',
                'custom-kb-99', // Validating the override worked
                0.7,
                'tenant-abc',
                'config-123',
            );
        });

        it('should fall back to empty string if kb_ids is null/missing', async () => {
            const configurationWithNoKbs = { id: '1', search_config: { kb_ids: null, threshold: 0.5 } };
            searchService.findOne.mockResolvedValue(configurationWithNoKbs as any);
            datasetService.mockRetrieveContext.mockResolvedValue({
                chunks: [],
                doc_aggs: [],
                labels: null,
                total: 0
            } as any);

            await service.retrieveDatasetChunks(mockUser, mockDto);

            expect(datasetService.mockRetrieveContext).toHaveBeenCalledWith(
                'test query',
                '',
                0.5,
                'tenant-abc',
                'config-123',
            );
        });

        it('should throw InternalServerErrorException if search_config is completely missing', async () => {
            searchService.findOne.mockResolvedValue({ id: '1', search_config: null } as any);

            await expect(service.retrieveDatasetChunks(mockUser, mockDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });

        it('should wrap generic errors in InternalServerErrorException if downstream dependencies crash', async () => {
            searchService.findOne.mockRejectedValue(new Error('DB Connection Timeout'));

            await expect(service.retrieveDatasetChunks(mockUser, mockDto)).rejects.toThrow(
                InternalServerErrorException
            );
        });
    });

    // ==========================================
    // 2. Tests for executeSse() (RxJS Observables)
    // ==========================================
    describe('executeSse', () => {
        it('should throw BadRequestException immediately if user context metadata is absent', () => {
            expect(() => service.executeSse(null as any, 'config-123', 'query')).toThrow(
                BadRequestException,
            );
            expect(() => service.executeSse({ userId: '' } as any, 'config-123', 'query')).toThrow(
                BadRequestException,
            );
        });

        it('should successfully execute pipeline and switchMap into LLM stream events', (done) => {
            searchService.findOne.mockResolvedValue(mockConfigDbResult as any);

            // Execute SSE handles Array fallback mapping, so returning raw array simulates old dataset service shape handling
            datasetService.mockRetrieveContext.mockResolvedValue([
                { ...mockDatasetChunk, chunk_id: 'chk-1' },
                { ...mockDatasetChunk, chunk_id: 'chk-2' },
                { ...mockDatasetChunk, chunk_id: 'chk-3' },
                { ...mockDatasetChunk, chunk_id: 'chk-4' },
            ] as any);

            const mockEventStream = [{ data: 'token1' }, { data: 'token2' }] as any;
            llmService.mockProcessSseNative.mockReturnValue(of(...mockEventStream));

            const stream$ = service.executeSse(mockUser, 'config-123', 'ai prompt');

            const receivedEvents: any[] = [];
            stream$.subscribe({
                next: (event) => receivedEvents.push(event),
                error: (err) => done(err),
                complete: () => {
                    expect(llmService.mockProcessSseNative).toHaveBeenCalledWith({
                        query: 'ai prompt',
                        context: [
                            { ...mockDatasetChunk, chunk_id: 'chk-1' },
                            { ...mockDatasetChunk, chunk_id: 'chk-2' },
                            { ...mockDatasetChunk, chunk_id: 'chk-3' },
                        ],
                        settings: mockSearchConfig,
                    });
                    expect(receivedEvents).toHaveLength(2);
                    done();
                },
            });
        });

        it('should emit error inside pipeline stream if async operations fail during subscription', (done) => {
            searchService.findOne.mockRejectedValue(new Error('Configuration Look up crashed'));

            const stream$ = service.executeSse(mockUser, 'config-123', 'query');

            stream$.subscribe({
                next: () => done(new Error('Should not emit regular stream items when setup crashes')),
                error: (err) => {
                    try {
                        expect(err.message).toBe('Failed to initialize streaming search pipeline.');
                        done();
                    } catch (assertionError) {
                        done(assertionError);
                    }
                },
            });
        });
    });
});