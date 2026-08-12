import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class LlmValidator {
  constructor(private prisma: PrismaService) {}

  async validateCreate(llm_name: string, factoryId: string) {
    const exists = await this.prisma.lLM.findUnique({
      where: {
        llm_name_factoryId: {
          llm_name,
          factoryId,
        },
      },
    });

    if (exists) {
      throw new BadRequestException(
        'LLM with this name already exists in this factory',
      );
    }
  }
}
