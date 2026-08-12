import { Injectable, NotFoundException } from '@nestjs/common';
import { LlmRepository } from './llm.repository';
import { ListLlmDto } from './dto/list-llm.dto';
import { LLM } from '@prisma/client';
import { LlmValidator } from './validators/llm.validator';
import { CreateLlmDto } from './dto/create-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';

@Injectable()
export class LlmService {
  constructor(
    private repo: LlmRepository,
    private validator: LlmValidator,
  ) {}

  async create(dto: CreateLlmDto) {
    await this.validator.validateCreate(dto.llm_name, dto.factoryId);
    return this.repo.create(dto);
  }

  update(id: string, dto: UpdateLlmDto) {
    return this.repo.update(id, dto);
  }

  async findAll(query: ListLlmDto): Promise<LLM[]> {
    return this.repo.findAll(query);
  }

  async findOne(id: string) {
    const llm = await this.repo.findById(id);

    if (!llm) {
      throw new NotFoundException('LLM not found');
    }

    return llm;
  }
}
