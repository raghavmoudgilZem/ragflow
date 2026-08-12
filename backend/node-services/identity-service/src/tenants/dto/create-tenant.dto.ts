import { IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(3, { message: 'Tenant name must be at least 3 characters long' })
  name!: string;
}
