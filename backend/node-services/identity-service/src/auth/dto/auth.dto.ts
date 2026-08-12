import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class RegisterDto {
  @ApiProperty({ example: 'fresh_admin@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({ example: 'SuperSecretPassword123', minLength: 8, description: 'User password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'fresh_admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SuperSecretPassword123' })
  @IsString()
  password!: string;


  @ApiPropertyOptional({ example: 'd4cb6689-58a1-4a4c-a8b6-f83740fe7cf2' })
  @IsOptional()
  @IsUUID('4', { message: 'activeTenantId must be a valid UUID' })
  activeTenantId?: string;
}
