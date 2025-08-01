import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateExceptionDto {
  @IsDateString()
  date: string; // Format: "2024-01-15"

  @IsOptional()
  @IsString()
  startTime?: string; // Format: "14:30", if null entire day is blocked

  @IsOptional()
  @IsString()
  endTime?: string; // Format: "16:30", if null entire day is blocked

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean; // For recurring exceptions (e.g., every Monday)

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  recurringDayOfWeek?: number; // 0-6 (Sunday-Saturday) for recurring exceptions
}
