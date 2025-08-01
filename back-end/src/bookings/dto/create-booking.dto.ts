import {
  IsDateString,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  bookingDate: string; // Format: "2024-01-15"

  @IsString()
  startTime: string; // Format: "14:30"

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
