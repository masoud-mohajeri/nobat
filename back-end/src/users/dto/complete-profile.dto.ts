import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CompleteProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
