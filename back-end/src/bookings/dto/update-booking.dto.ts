import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../common/enums/booking-status.enum';

export class UpdateBookingDto {
  @ApiProperty({
    description: 'Booking status',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Stylist notes about the booking',
    example: 'Client prefers natural look',
    required: false,
  })
  @IsOptional()
  @IsString()
  stylistNotes?: string;

  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Client requested cancellation',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({
    description: 'Who cancelled the booking',
    example: 'customer',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancelledBy?: string;

  @ApiProperty({
    description: 'Deposit amount in Rials',
    example: 50000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiProperty({
    description: 'Total amount in Rials',
    example: 100000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;
}
