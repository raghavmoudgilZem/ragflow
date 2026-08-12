import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Active JWT refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'RefreshToken must not be empty' })
  refreshToken!: string;
}