import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { UpdateSearchNameDto } from './dto/update-search-name.dto';

@ApiTags('searches')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller({ path: 'search-execution', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new search' })
  @ApiResponse({ status: 201, description: 'Search successfully created' })
  async create(
    @Body() createSearchDto: CreateSearchDto,
    @User('userId') userId: string,
    @User('tenantId') tenantId: string | undefined,
  ) {
    return this.searchService.create(userId, tenantId, createSearchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all searches' })
  @ApiResponse({ status: 200, description: 'Returns a list of searches' })
  async findAll(
    @User('tenantId') tenantId: string,
    @Query() query: SearchQueryDto,
  ) {
    return this.searchService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific search by ID' })
  @ApiResponse({ status: 200, description: 'Returns the requested search' })
  @ApiResponse({ status: 404, description: 'Search not found' })
  async findOne(@Param('id') id: string, @User() user: User) {
    return this.searchService.findOne(id, user);
  }


  @Patch(':id/name')
  @ApiOperation({ summary: 'Update only the name of a search configuration' })
  @ApiResponse({ status: 200, description: 'Search name successfully updated' })
  async updateName(
    @Param('id') id: string,
    @Body() updateNameDto: UpdateSearchNameDto,
    @User() user: User,
  ) {
    return this.searchService.updateName(id, user, updateNameDto.name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a search' })
  @ApiResponse({ status: 200, description: 'Search successfully updated' })
  async update(
    @Param('id') id: string,
    @Body() updateSearchDto: UpdateSearchDto,
    @User() user: User,
  ) {
    // Use the ID from the URL parameter to maintain REST conventions
    return this.searchService.update(id, user, updateSearchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a search' })
  @ApiResponse({ status: 200, description: 'Search successfully removed' })
  async remove(@Param('id') id: string, @User() user: User) {
    return this.searchService.remove(id, user);
  }
}
