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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@ApiTags('bookings')
@Controller('api/v1/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid booking data or unavailable slot',
  })
  @ApiResponse({ status: 404, description: 'Stylist not found' })
  @ApiQuery({ name: 'stylistId', description: 'Stylist ID', type: String })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Get user bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking status',
    required: false,
    enum: BookingStatus,
  })
  @ApiBearerAuth('JWT-auth')
  @Get()
  async getMyBookings(
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.getCustomerBookings(user.userId, status);
  }

  @ApiOperation({ summary: 'Get specific booking' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async getBooking(@CurrentUser() user: any, @Param('id') bookingId: string) {
    return this.bookingsService.getBooking(bookingId);
  }

  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid booking data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(bookingId, updateBookingDto);
  }

  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancelBooking(bookingId, 'customer', reason);
  }

  @ApiOperation({ summary: 'Reschedule booking' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid reschedule data or unavailable slot',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
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
