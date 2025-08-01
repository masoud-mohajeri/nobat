import {
  IsDateString,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Booking date in YYYY-MM-DD format',
    example: '2024-12-26',
  })
  @IsDateString()
  bookingDate: string; // Format: "2024-01-15"

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '14:30',
  })
  @IsString()
  startTime: string; // Format: "14:30"

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '15:30',
  })
  @IsString()
  endTime: string; // Format: "15:30"

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  // Customer information (for public booking)
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;
}
