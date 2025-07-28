import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCustomerProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
