import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAvailabilityDto {
  // Daily work configuration
  @ApiProperty({
    description: 'Monday start time (HH:MM format)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  mondayStart?: string; // Format: "09:00"

  @IsOptional()
  @IsString()
  mondayEnd?: string;

  @IsOptional()
  @IsString()
  tuesdayStart?: string;

  @IsOptional()
  @IsString()
  tuesdayEnd?: string;

  @IsOptional()
  @IsString()
  wednesdayStart?: string;

  @IsOptional()
  @IsString()
  wednesdayEnd?: string;

  @IsOptional()
  @IsString()
  thursdayStart?: string;

  @IsOptional()
  @IsString()
  thursdayEnd?: string;

  @IsOptional()
  @IsString()
  fridayStart?: string;

  @IsOptional()
  @IsString()
  fridayEnd?: string;

  @IsOptional()
  @IsString()
  saturdayStart?: string;

  @IsOptional()
  @IsString()
  saturdayEnd?: string;

  @IsOptional()
  @IsString()
  sundayStart?: string;

  @IsOptional()
  @IsString()
  sundayEnd?: string;

  // Slot configuration
  @ApiProperty({
    description: 'Duration of each booking slot in minutes',
    example: 60,
    minimum: 15,
    maximum: 480,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  slotDurationMinutes?: number; // 15 minutes to 8 hours

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferTimeMinutes?: number; // 0 to 2 hours

  @ApiProperty({
    description: 'Minimum notice required for booking in minutes',
    example: 120,
    minimum: 30,
    maximum: 1440,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(1440)
  minimumNoticeMinutes?: number; // 30 minutes to 24 hours

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  maxAdvanceDays?: number; // 1 day to 1 year

  @IsOptional()
  @IsBoolean()
  allowMultipleClients?: boolean;
}
