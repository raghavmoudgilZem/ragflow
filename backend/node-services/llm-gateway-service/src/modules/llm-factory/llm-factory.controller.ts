import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LlmFactoryService } from './llm-factory.service';
import { CreateLlmFactoryDto } from './dto/create-llm-factory.dto';
import { UpdateLlmFactoryDto } from './dto/update-llm-factory.dto';
import { ListLlmFactoryDto } from './dto/list-llm-factory.dto';
import { PaginationDto } from './dto/pagination.dto';
import { LLMFactory } from '@prisma/client';

@Controller({
  path: 'llm-factory',
  version: '1',
})
export class LlmFactoryController {
  constructor(private readonly service: LlmFactoryService) {}

  @Post()
  async create(@Body() dto: CreateLlmFactoryDto): Promise<LLMFactory> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query() filters: ListLlmFactoryDto,
    @Query() pagination: PaginationDto,
  ): Promise<LLMFactory[]> {
    return this.service.findAll(filters, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LLMFactory> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLlmFactoryDto,
  ): Promise<LLMFactory> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<LLMFactory> {
    return this.service.remove(id);
  }
}
