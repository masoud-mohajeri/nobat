import {
  IsDateString,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExceptionDto {
  @ApiProperty({
    description: 'Exception date in YYYY-MM-DD format',
    example: '2024-12-26',
  })
  @IsDateString()
  date: string; // Format: "2024-01-15"

  @ApiProperty({
    description: 'Start time in HH:MM format (if null, entire day is blocked)',
    example: '14:30',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string; // Format: "14:30", if null entire day is blocked

  @ApiProperty({
    description: 'End time in HH:MM format (if null, entire day is blocked)',
    example: '16:30',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string; // Format: "16:30", if null entire day is blocked

  @ApiProperty({
    description: 'Reason for the exception',
    example: 'Personal appointment',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Whether this is a recurring exception',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean; // For recurring exceptions (e.g., every Monday)

  @ApiProperty({
    description: 'Day of week for recurring exceptions (0=Sunday, 6=Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  recurringDayOfWeek?: number; // 0-6 (Sunday-Saturday) for recurring exceptions
}
