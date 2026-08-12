import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class LlmFactoryValidator {
  constructor(private readonly prisma: PrismaService) {}

  async validateCreate(name: string): Promise<void> {
    const exists: number = await this.prisma.lLMFactory.count({
      where: { name },
    });

    if (exists > 0) {
      throw new BadRequestException('Factory with this name already exists');
    }
  }

  async validateExists(id: string): Promise<void> {
    const exists: number = await this.prisma.lLMFactory.count({
      where: { id },
    });

    if (exists === 0) {
      throw new NotFoundException('LLM Factory not found');
    }
  }
}
