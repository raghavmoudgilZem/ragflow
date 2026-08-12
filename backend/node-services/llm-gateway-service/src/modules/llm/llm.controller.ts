import { Controller, Post, Get, Param, Body, Query, Put } from '@nestjs/common';
import { LlmService } from './llm.service';
import { CreateLlmDto } from './dto/create-llm.dto';
import { ListLlmDto } from './dto/list-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';

@Controller({
  path: 'llm',
  version: '1',
})
export class LlmController {
  constructor(private readonly service: LlmService) {}

  @Post()
  create(@Body() dto: CreateLlmDto) {
    return this.service.create(dto);
  }

  // GET /llm
  @Get()
  async findAll(@Query() query: ListLlmDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLlmDto) {
    return this.service.update(id, dto);
  }
}
