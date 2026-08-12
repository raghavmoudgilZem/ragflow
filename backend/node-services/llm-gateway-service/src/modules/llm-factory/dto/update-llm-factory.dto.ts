import { PartialType } from '@nestjs/mapped-types';
import { CreateLlmFactoryDto } from './create-llm-factory.dto';

export class UpdateLlmFactoryDto extends PartialType(CreateLlmFactoryDto) {}
