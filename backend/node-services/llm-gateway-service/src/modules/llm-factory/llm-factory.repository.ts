import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateLlmFactoryDto } from './dto/create-llm-factory.dto';
import { UpdateLlmFactoryDto } from './dto/update-llm-factory.dto';
import { ListLlmFactoryDto } from './dto/list-llm-factory.dto';
import { LLMFactory } from '@prisma/client';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class LlmFactoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLlmFactoryDto): Promise<LLMFactory> {
    return this.prisma.lLMFactory.create({
      data: dto,
    });
  }

  update(id: string, dto: UpdateLlmFactoryDto): Promise<LLMFactory> {
    return this.prisma.lLMFactory.update({
      where: { id },
      data: dto,
    });
  }

  findAll(
    query: ListLlmFactoryDto,
    pagination: PaginationDto,
  ): Promise<LLMFactory[]> {
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit =
      pagination.limit && pagination.limit > 0 ? pagination.limit : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    return this.prisma.lLMFactory.findMany({
      where: {
        name: query.name ? { contains: query.name } : undefined,
        status: query.status,
      },
      include: {
        llms: true,
      },
      orderBy: { rank: 'desc' },
      skip,
      take,
    });
  }

  findById(id: string): Promise<LLMFactory> {
    return this.prisma.lLMFactory.findUniqueOrThrow({
      where: { id },
    });
  }

  delete(id: string): Promise<LLMFactory> {
    return this.prisma.lLMFactory.delete({
      where: { id },
    });
  }
}
