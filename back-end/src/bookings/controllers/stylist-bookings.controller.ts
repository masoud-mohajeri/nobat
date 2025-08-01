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
import { SetAvailabilityDto } from '../dto/set-availability.dto';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StylistRoleGuard } from '../../stylists/guards/stylist-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@ApiTags('stylists')
@Controller('api/v1/stylists')
@UseGuards(JwtAuthGuard, StylistRoleGuard)
export class StylistBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Availability Management
  @ApiOperation({ summary: 'Set stylist availability schedule' })
  @ApiResponse({ status: 200, description: 'Availability set successfully' })
  @ApiResponse({ status: 400, description: 'Invalid availability data' })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Get stylist availability schedule' })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  @ApiBearerAuth('JWT-auth')
  @Get('availability')
  async getAvailability(@CurrentUser() user: any) {
    return this.bookingsService.getAvailability(user.userId);
  }

  @ApiOperation({ summary: 'Get available slots for a specific date' })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
  })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2024-12-26',
  })
  @ApiBearerAuth('JWT-auth')
  @Get('availability/slots')
  async getAvailableSlots(
    @CurrentUser() user: any,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailableSlots(user.userId, date);
  }

  // Exception Management
  @ApiOperation({ summary: 'Create availability exception' })
  @ApiResponse({ status: 201, description: 'Exception created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid exception data' })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Get availability exceptions' })
  @ApiResponse({
    status: 200,
    description: 'Exceptions retrieved successfully',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date in YYYY-MM-DD format',
    required: false,
    example: '2024-12-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date in YYYY-MM-DD format',
    required: false,
    example: '2024-12-31',
  })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Delete availability exception' })
  @ApiResponse({ status: 200, description: 'Exception deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exception not found' })
  @ApiParam({ name: 'id', description: 'Exception ID' })
  @ApiBearerAuth('JWT-auth')
  @Delete('exceptions/:id')
  @HttpCode(HttpStatus.OK)
  async deleteException(
    @CurrentUser() user: any,
    @Param('id') exceptionId: string,
  ) {
    return this.bookingsService.deleteException(exceptionId, user.userId);
  }

  // Booking Management
  @ApiOperation({ summary: 'Get stylist bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking status',
    required: false,
    enum: BookingStatus,
  })
  @ApiBearerAuth('JWT-auth')
  @Get('bookings')
  async getStylistBookings(
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.getStylistBookings(user.userId, status);
  }

  @ApiOperation({ summary: 'Get specific stylist booking' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
  @Get('bookings/:id')
  async getStylistBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
  ) {
    return this.bookingsService.getBooking(bookingId);
  }

  @ApiOperation({ summary: 'Update stylist booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid booking data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
  @Put('bookings/:id')
  @HttpCode(HttpStatus.OK)
  async updateStylistBooking(
    @CurrentUser() user: any,
    @Param('id') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(bookingId, updateBookingDto);
  }

  @ApiOperation({ summary: 'Cancel stylist booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBearerAuth('JWT-auth')
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
