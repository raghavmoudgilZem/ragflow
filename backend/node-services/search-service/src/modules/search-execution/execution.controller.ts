import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Res,
  Sse,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { User } from '../../common/decorators/user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Observable } from 'rxjs';
import { SearchExecutionPayloadDto } from './dto/searchExecution.dto';

@ApiTags('search-execution')
@ApiBearerAuth()
@Controller({ path: 'search-execution', version: '1' })
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) { }

  @Post('search')
  @ApiOperation({ summary: 'Retrieve dataset chunks' })
  @ApiResponse({ status: 200, description: 'Returns RAG chunks' })
  @UseGuards(AuthGuard)
  async search(
    @Body() dto: SearchExecutionPayloadDto,
    @User() user: User,
  ) {
    return await this.executionService.retrieveDatasetChunks(user, dto);
  }

  @Sse(':id/completions')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get AI summary completions stream' })
  @ApiQuery({ name: 'question', type: String, description: 'The search prompt' })
  @ApiQuery({ name: 'kb_ids', type: [String], required: false, description: 'Optional KB IDs override' })
  @ApiQuery({ name: 'tenantId', type: String, required: false, description: 'Optional Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns native RxJS SSE stream event',
  })
  completions(
    @Param('id') id: string,
    @Query('question') question: string,
    @Query('kb_ids') kb_ids: string | string[], // Express parses single query array items as a string
    @Query('tenantId') tenantId: string,
    @User() user: User,
  ): Observable<MessageEvent> {

    // Normalize kb_ids: if it's a single string from the URL, wrap it in an array. 
    const normalizedKbIds = kb_ids ? (Array.isArray(kb_ids) ? kb_ids : [kb_ids]) : undefined;

    return this.executionService.executeSse(user, id, question, normalizedKbIds, tenantId);
  }
}
