import { IsString } from 'class-validator';

export class CreateSearchDto {
  @IsString()
  name!: string;
}
