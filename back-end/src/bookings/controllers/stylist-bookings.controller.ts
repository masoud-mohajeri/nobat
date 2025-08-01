import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { SetAvailabilityDto } from '../dto/set-availability.dto';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StylistRoleGuard } from '../../stylists/guards/stylist-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Controller('api/v1/stylists')
@UseGuards(JwtAuthGuard, StylistRoleGuard)
export class StylistBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Availability Management
  @Post('availability')
  @HttpCode(HttpStatus.OK)
  async setAvailability(
    @CurrentUser() user: any,
    @Body() setAvailabilityDto: SetAvailabilityDto,
  ) {
    return this.bookingsService.setAvailability(
      user.userId,
      setAvailabilityDto,
    );
  }

  @Get('availability')
  async getAvailability(@CurrentUser() user: any) {
    return this.bookingsService.getAvailability(user.userId);
  }

  @Get('availability/slots')
  async getAvailableSlots(
    @CurrentUser() user: any,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(user.userId, date);
  }

  // Exception Management
  @Post('exceptions')
  @HttpCode(HttpStatus.CREATED)
  async createException(
    @CurrentUser() user: any,
    @Body() createExceptionDto: CreateExceptionDto,
  ) {
    return this.bookingsService.createException(
      user.userId,
      createExceptionDto,
    );
  }

  @Get('exceptions')
  async getExceptions(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.bookingsService.getExceptions(user.userId, start, end);
  }

  @Delete('exceptions/:id')
  @HttpCode(HttpStatus.OK)
  async deleteException(
    @CurrentUser() user: any,
    @Param('id') exceptionId: string,
  ) {
    return this.bookingsService.deleteException(exceptionId, user.userId);
  }

  // Booking Management
  @Get('bookings')
  async getStylistBookings(
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.getStylistBookings(user.userId, status);
  }

  @Get('bookings/:id')
  async getStylistBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.getBooking(bookingId);
  }

  @Put('bookings/:id')
  @HttpCode(HttpStatus.OK)
  async updateStylistBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(bookingId, updateBookingDto);
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.OK)
  async cancelStylistBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(bookingId, 'stylist', reason);
  }
}
