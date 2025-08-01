import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@ApiTags('public')
@Controller('api/v1/public')
export class PublicBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Get stylist availability for a specific date' })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Stylist not found' })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2024-12-26',
  })
  @Get('stylists/:stylistId/availability')
  async getStylistAvailability(
    @Param('stylistId') stylistId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(stylistId, date);
  }

  @ApiOperation({
    summary: 'Create a public booking (no authentication required)',
  })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid booking data or unavailable slot',
  })
  @ApiResponse({ status: 404, description: 'Stylist not found' })
  @Post('stylists/:stylistId/book')
  @HttpCode(HttpStatus.CREATED)
  async createPublicBooking(
    @Param('stylistId') stylistId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createPublicBooking(
      stylistId,
      createBookingDto,
    );
  }

  @ApiOperation({ summary: 'Get public booking information' })
  @ApiResponse({
    status: 200,
    description: 'Booking information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Get('bookings/:id')
  async getPublicBooking(@Param('id') bookingId: string) {
    return this.bookingsService.getPublicBooking(bookingId);
  }
}
