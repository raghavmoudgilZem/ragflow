import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ListLlmDto } from './dto/list-llm.dto';
import { CreateLlmDto } from './dto/create-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';
import { LLM } from '@prisma/client';

@Injectable()
export class LlmRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLlmDto): Promise<LLM> {
    const llm: LLM = await this.prisma.lLM.create({
      data,
    });

    return llm;
  }

  async update(id: string, data: UpdateLlmDto): Promise<LLM> {
    const llm: LLM = await this.prisma.lLM.update({
      where: { id },
      data,
    });

    return llm;
  }

  async findAll(query: ListLlmDto): Promise<LLM[]> {
    const {
      llm_name,
      model_type,
      factoryId,
      is_tools,
      page = 1,
      limit = 10,
    } = query;

    const llms: LLM[] = await this.prisma.lLM.findMany({
      where: {
        ...(llm_name && {
          llm_name: { contains: llm_name },
        }),
        ...(model_type && { model_type }),
        ...(factoryId && { factoryId }),
        ...(typeof is_tools === 'boolean' && {
          is_tools,
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return llms;
  }

  async findById(id: string): Promise<LLM | null> {
    return this.prisma.lLM.findUnique({
      where: { id },
    });
  }
}
