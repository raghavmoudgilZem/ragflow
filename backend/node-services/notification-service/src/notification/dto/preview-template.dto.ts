import { IsNotEmpty, IsObject } from 'class-validator';

export class PreviewTemplateDto {
  @IsObject()
  @IsNotEmpty()
  data: Record<string, string>;
}
