import { Injectable } from '@nestjs/common';
import { LlmFactoryRepository } from './llm-factory.repository';
import { LlmFactoryValidator } from './validators/llm-factory.validators';
import { CreateLlmFactoryDto } from './dto/create-llm-factory.dto';
import { UpdateLlmFactoryDto } from './dto/update-llm-factory.dto';
import { ListLlmFactoryDto } from './dto/list-llm-factory.dto';
import { PaginationDto } from './dto/pagination.dto';
import { LLMFactory } from '@prisma/client';

@Injectable()
export class LlmFactoryService {
  constructor(
    private readonly repo: LlmFactoryRepository,
    private readonly validator: LlmFactoryValidator,
  ) {}

  async create(dto: CreateLlmFactoryDto): Promise<LLMFactory> {
    await this.validator.validateCreate(dto.name);
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateLlmFactoryDto): Promise<LLMFactory> {
    await this.validator.validateExists(id);
    return this.repo.update(id, dto);
  }

  async findAll(
    query: ListLlmFactoryDto,
    pagination: PaginationDto,
  ): Promise<LLMFactory[]> {
    return this.repo.findAll(query, pagination);
  }

  async findOne(id: string): Promise<LLMFactory> {
    await this.validator.validateExists(id);
    return this.repo.findById(id);
  }

  async remove(id: string): Promise<LLMFactory> {
    await this.validator.validateExists(id);
    return this.repo.delete(id);
  }
}
