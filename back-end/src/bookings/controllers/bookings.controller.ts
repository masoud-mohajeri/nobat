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
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Controller('api/v1/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @CurrentUser() user: any,
    @Body() createBookingDto: CreateBookingDto,
    @Query('stylistId') stylistId: string,
  ) {
    return this.bookingsService.createBooking(
      stylistId,
      user.userId,
      createBookingDto,
    );
  }

  @Get()
  async getMyBookings(
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.getCustomerBookings(user.userId, status);
  }

  @Get(':id')
  async getBooking(@CurrentUser() user: any, @Param('id') bookingId: string) {
    return this.bookingsService.getBooking(bookingId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(bookingId, updateBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(bookingId, 'customer', reason);
  }

  @Post(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  async rescheduleBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body()
    rescheduleDto: {
      newDate: string;
      newStartTime: string;
      newEndTime: string;
    },
  ) {
    return this.bookingsService.rescheduleBooking(
      bookingId,
      rescheduleDto.newDate,
      rescheduleDto.newStartTime,
      rescheduleDto.newEndTime,
    );
  }
}
