import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSearchNameDto {
  @ApiProperty({
    description: 'The new name for the search configuration',
    example: 'My Updated Search App',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}