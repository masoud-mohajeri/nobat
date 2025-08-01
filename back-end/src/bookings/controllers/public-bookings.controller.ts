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
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Controller('api/v1/public')
export class PublicBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('stylists/:stylistId/availability')
  async getStylistAvailability(
    @Param('stylistId') stylistId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(stylistId, date);
  }

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

  @Get('bookings/:id')
  async getPublicBooking(@Param('id') bookingId: string) {
    return this.bookingsService.getPublicBooking(bookingId);
  }
}
