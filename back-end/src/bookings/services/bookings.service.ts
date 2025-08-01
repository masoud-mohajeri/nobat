import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { StylistAvailability } from '../entities/stylist-availability.entity';
import { StylistException } from '../entities/stylist-exception.entity';
import { User } from '../../users/entities/user.entity';
import { StylistProfile } from '../../stylists/entities/stylist-profile.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { SetAvailabilityDto } from '../dto/set-availability.dto';
import { CreateExceptionDto } from '../dto/create-exception.dto';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { OtpServiceInterface } from '../../auth/interfaces/otp-service.interface';
import { BookingSmsDetails } from '../../common/interfaces/sms-service.interface';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(StylistAvailability)
    private readonly availabilityRepository: Repository<StylistAvailability>,
    @InjectRepository(StylistException)
    private readonly exceptionRepository: Repository<StylistException>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StylistProfile)
    private readonly stylistProfileRepository: Repository<StylistProfile>,
    private readonly otpService: OtpServiceInterface,
  ) {}

  // Availability Management
  async setAvailability(
    stylistId: string,
    setAvailabilityDto: SetAvailabilityDto,
  ): Promise<StylistAvailability> {
    let availability = await this.availabilityRepository.findOne({
      where: { stylistId },
    });

    if (!availability) {
      availability = this.availabilityRepository.create({
        stylistId,
        ...setAvailabilityDto,
      });
    } else {
      Object.assign(availability, setAvailabilityDto);
    }

    return this.availabilityRepository.save(availability);
  }

  async getAvailability(stylistId: string): Promise<StylistAvailability> {
    const availability = await this.availabilityRepository.findOne({
      where: { stylistId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found for this stylist');
    }

    return availability;
  }

  // Exception Management
  async createException(
    stylistId: string,
    createExceptionDto: CreateExceptionDto,
  ): Promise<StylistException> {
    const exception = this.exceptionRepository.create({
      stylistId,
      ...createExceptionDto,
      date: new Date(createExceptionDto.date),
    });

    return this.exceptionRepository.save(exception);
  }

  async getExceptions(
    stylistId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StylistException[]> {
    const query = this.exceptionRepository
      .createQueryBuilder('exception')
      .where('exception.stylistId = :stylistId', { stylistId });

    if (startDate && endDate) {
      query.andWhere('exception.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query.getMany();
  }

  async deleteException(exceptionId: string, stylistId: string): Promise<void> {
    const exception = await this.exceptionRepository.findOne({
      where: { id: exceptionId, stylistId },
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    await this.exceptionRepository.remove(exception);
  }

  // Booking Management
  async createBooking(
    stylistId: string,
    customerId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    // Validate stylist exists and is approved
    const stylistProfile = await this.stylistProfileRepository.findOne({
      where: { userId: stylistId, status: StylistProfileStatus.APPROVED },
    });

    if (!stylistProfile) {
      throw new NotFoundException('Stylist not found or not approved');
    }

    // Validate customer exists
    const customer = await this.userRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check availability
    await this.validateBookingAvailability(stylistId, createBookingDto);

    // Create booking
    const booking = this.bookingRepository.create({
      stylistId,
      customerId,
      bookingDate: new Date(createBookingDto.bookingDate),
      startTime: createBookingDto.startTime,
      endTime: createBookingDto.endTime,
      customerNotes: createBookingDto.customerNotes,
      depositAmount: createBookingDto.depositAmount,
      totalAmount: createBookingDto.totalAmount,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Send notifications
    await this.sendBookingNotifications(savedBooking);

    return savedBooking;
  }

  async createPublicBooking(
    stylistId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    // Validate stylist exists and is approved
    const stylistProfile = await this.stylistProfileRepository.findOne({
      where: { userId: stylistId, status: StylistProfileStatus.APPROVED },
    });

    if (!stylistProfile) {
      throw new NotFoundException('Stylist not found or not approved');
    }

    // Check availability
    await this.validateBookingAvailability(stylistId, createBookingDto);

    // Find or create customer by phone
    let customer = await this.userRepository.findOne({
      where: { phoneNumber: createBookingDto.customerPhone },
    });

    if (!customer) {
      // Create new customer
      customer = this.userRepository.create({
        phoneNumber: createBookingDto.customerPhone,
        firstName: createBookingDto.customerName,
        isPhoneVerified: false, // Will be verified later
        status: UserStatus.ACTIVE,
      });
      customer = await this.userRepository.save(customer);
    }

    // Create booking
    const booking = this.bookingRepository.create({
      stylistId,
      customerId: customer.id,
      bookingDate: new Date(createBookingDto.bookingDate),
      startTime: createBookingDto.startTime,
      endTime: createBookingDto.endTime,
      customerNotes: createBookingDto.customerNotes,
      depositAmount: createBookingDto.depositAmount,
      totalAmount: createBookingDto.totalAmount,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Send notifications
    await this.sendBookingNotifications(savedBooking);

    return savedBooking;
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['stylist', 'customer', 'stylist.user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getPublicBooking(bookingId: string): Promise<any> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['stylist', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Get stylist profile
    const stylistProfile = await this.stylistProfileRepository.findOne({
      where: { userId: booking.stylistId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Return limited information for public access
    return {
      id: booking.id,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      stylist: {
        name: `${booking.stylist.firstName} ${booking.stylist.lastName}`,
        salonAddress: stylistProfile?.salonAddress || '',
      },
      customer: {
        name: `${booking.customer.firstName} ${booking.customer.lastName}`,
        phone: booking.customer.phoneNumber,
      },
    };
  }

  async updateBooking(
    bookingId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Handle status changes
    if (updateBookingDto.status) {
      await this.handleStatusChange(
        booking,
        updateBookingDto.status,
        updateBookingDto,
      );
    }

    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async cancelBooking(
    bookingId: string,
    cancelledBy: string,
    reason?: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledBy = cancelledBy;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;

    const savedBooking = await this.bookingRepository.save(booking);

    // Send cancellation notification
    await this.sendCancellationNotification(savedBooking);

    return savedBooking;
  }

  async rescheduleBooking(
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
  ): Promise<Booking> {
    const originalBooking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!originalBooking) {
      throw new NotFoundException('Booking not found');
    }

    if (originalBooking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot reschedule a cancelled booking');
    }

    // Validate new availability
    await this.validateBookingAvailability(originalBooking.stylistId, {
      bookingDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });

    // Mark original booking as rescheduled
    originalBooking.status = BookingStatus.RESCHEDULED;
    await this.bookingRepository.save(originalBooking);

    // Create new booking
    const newBooking = this.bookingRepository.create({
      stylistId: originalBooking.stylistId,
      customerId: originalBooking.customerId,
      bookingDate: new Date(newDate),
      startTime: newStartTime,
      endTime: newEndTime,
      customerNotes: originalBooking.customerNotes,
      depositAmount: originalBooking.depositAmount,
      totalAmount: originalBooking.totalAmount,
      status: BookingStatus.CONFIRMED,
      rescheduledFrom: originalBooking.id,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    // Send reschedule notification
    await this.sendRescheduleNotification(originalBooking, savedBooking);

    return savedBooking;
  }

  async getStylistBookings(
    stylistId: string,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .where('booking.stylistId = :stylistId', { stylistId });

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    return query
      .orderBy('booking.bookingDate', 'ASC')
      .addOrderBy('booking.startTime', 'ASC')
      .getMany();
  }

  async getCustomerBookings(
    customerId: string,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.stylist', 'stylist')
      .leftJoinAndSelect('stylist.user', 'stylistUser')
      .where('booking.customerId = :customerId', { customerId });

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    return query
      .orderBy('booking.bookingDate', 'ASC')
      .addOrderBy('booking.startTime', 'ASC')
      .getMany();
  }

  async getAvailableSlots(stylistId: string, date: string): Promise<string[]> {
    const availability = await this.getAvailability(stylistId);
    const exceptions = await this.getExceptions(
      stylistId,
      new Date(date),
      new Date(date),
    );

    // Get day of week (0-6, Sunday-Saturday)
    const dayOfWeek = new Date(date).getDay();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayName = dayNames[dayOfWeek];

    // Get working hours for this day
    const startTime = availability[`${dayName}Start`];
    const endTime = availability[`${dayName}End`];

    if (!startTime || !endTime) {
      return []; // Not working on this day
    }

    // Check if entire day is blocked by exception
    const dayException = exceptions.find((e) => !e.startTime && !e.endTime);
    if (dayException) {
      return []; // Entire day is blocked
    }

    // Generate time slots
    const slots: string[] = [];
    const slotDuration = availability.slotDurationMinutes;
    const bufferTime = availability.bufferTimeMinutes;

    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    while (currentTime < endDateTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000)
        .toTimeString()
        .slice(0, 5);

      // Check if slot is available
      if (await this.isSlotAvailable(stylistId, date, slotStart, slotEnd)) {
        slots.push(slotStart);
      }

      // Move to next slot
      currentTime = new Date(
        currentTime.getTime() + (slotDuration + bufferTime) * 60000,
      );
    }

    return slots;
  }

  // Private helper methods
  private async validateBookingAvailability(
    stylistId: string,
    bookingDto: CreateBookingDto,
  ): Promise<void> {
    const availability = await this.getAvailability(stylistId);
    const bookingDate = new Date(bookingDto.bookingDate);
    const dayOfWeek = bookingDate.getDay();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayName = dayNames[dayOfWeek];

    // Check if stylist works on this day
    const startTime = availability[`${dayName}Start`];
    const endTime = availability[`${dayName}End`];

    if (!startTime || !endTime) {
      throw new BadRequestException('Stylist does not work on this day');
    }

    // Check minimum notice period
    const now = new Date();
    const bookingDateTime = new Date(
      `${bookingDto.bookingDate}T${bookingDto.startTime}`,
    );
    const noticeMinutes =
      (bookingDateTime.getTime() - now.getTime()) / (1000 * 60);

    if (noticeMinutes < availability.minimumNoticeMinutes) {
      throw new BadRequestException(
        `Booking must be made at least ${availability.minimumNoticeMinutes} minutes in advance`,
      );
    }

    // Check maximum advance period
    const advanceDays = Math.ceil(
      (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (advanceDays > availability.maxAdvanceDays) {
      throw new BadRequestException(
        `Booking cannot be made more than ${availability.maxAdvanceDays} days in advance`,
      );
    }

    // Check if slot is available
    if (
      !(await this.isSlotAvailable(
        stylistId,
        bookingDto.bookingDate,
        bookingDto.startTime,
        bookingDto.endTime,
      ))
    ) {
      throw new ConflictException('Selected time slot is not available');
    }
  }

  private async isSlotAvailable(
    stylistId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    // Check exceptions
    const exceptions = await this.getExceptions(
      stylistId,
      new Date(date),
      new Date(date),
    );

    for (const exception of exceptions) {
      if (!exception.startTime && !exception.endTime) {
        return false; // Entire day is blocked
      }

      if (exception.startTime && exception.endTime) {
        // Check if booking overlaps with exception
        if (startTime < exception.endTime && endTime > exception.startTime) {
          return false;
        }
      }
    }

    // Check existing bookings
    const existingBookings = await this.bookingRepository.find({
      where: {
        stylistId,
        bookingDate: new Date(date),
        status: BookingStatus.PENDING,
      },
    });

    // Also check confirmed bookings
    const confirmedBookings = await this.bookingRepository.find({
      where: {
        stylistId,
        bookingDate: new Date(date),
        status: BookingStatus.CONFIRMED,
      },
    });

    const allBookings = [...existingBookings, ...confirmedBookings];

    for (const booking of allBookings) {
      // Check if booking overlaps
      if (startTime < booking.endTime && endTime > booking.startTime) {
        return false;
      }
    }

    return true;
  }

  private async handleStatusChange(
    booking: Booking,
    newStatus: BookingStatus,
    updateDto: UpdateBookingDto,
  ): Promise<void> {
    switch (newStatus) {
      case BookingStatus.CONFIRMED:
        booking.confirmedAt = new Date();
        break;
      case BookingStatus.COMPLETED:
        booking.completedAt = new Date();
        break;
      case BookingStatus.CANCELLED:
        booking.cancelledAt = new Date();
        booking.cancelledBy = updateDto.cancelledBy;
        booking.cancellationReason = updateDto.cancellationReason;
        break;
    }
  }

  private async sendBookingNotifications(booking: Booking): Promise<void> {
    // Get stylist profile for additional details
    const stylistProfile = await this.stylistProfileRepository.findOne({
      where: { userId: booking.stylistId },
    });

    const bookingDetails: BookingSmsDetails = {
      bookingId: booking.id,
      bookingDate: booking.bookingDate.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      stylistName: `${booking.stylist.firstName} ${booking.stylist.lastName}`,
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      salonAddress: stylistProfile?.salonAddress,
      customerPhone: booking.customer.phoneNumber,
      stylistPhone: booking.stylist.phoneNumber,
      depositAmount: booking.depositAmount,
      totalAmount: booking.totalAmount,
    };

    // Send notification to stylist
    await this.otpService.sendStylistNotification(
      booking.stylist.phoneNumber,
      bookingDetails,
    );

    // Send confirmation to customer
    await this.otpService.sendBookingConfirmation(
      booking.customer.phoneNumber,
      bookingDetails,
    );
  }

  private async sendCancellationNotification(booking: Booking): Promise<void> {
    // Get stylist profile for additional details
    const stylistProfile = await this.stylistProfileRepository.findOne({
      where: { userId: booking.stylistId },
    });

    const bookingDetails: BookingSmsDetails = {
      bookingId: booking.id,
      bookingDate: booking.bookingDate.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      stylistName: `${booking.stylist.firstName} ${booking.stylist.lastName}`,
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      salonAddress: stylistProfile?.salonAddress,
      customerPhone: booking.customer.phoneNumber,
      stylistPhone: booking.stylist.phoneNumber,
      cancellationReason: booking.cancellationReason,
    };

    // Send cancellation SMS to customer
    await this.otpService.sendBookingCancellation(
      booking.customer.phoneNumber,
      bookingDetails,
    );
  }

  private async sendRescheduleNotification(
    originalBooking: Booking,
    newBooking: Booking,
  ): Promise<void> {
    // Get stylist profile for additional details
    const stylistProfile = await this.stylistProfileRepository.findOne({
      where: { userId: originalBooking.stylistId },
    });

    const bookingDetails: BookingSmsDetails = {
      bookingId: newBooking.id,
      bookingDate: originalBooking.bookingDate.toISOString().split('T')[0],
      startTime: originalBooking.startTime,
      endTime: originalBooking.endTime,
      stylistName: `${originalBooking.stylist.firstName} ${originalBooking.stylist.lastName}`,
      customerName: `${originalBooking.customer.firstName} ${originalBooking.customer.lastName}`,
      salonAddress: stylistProfile?.salonAddress,
      customerPhone: originalBooking.customer.phoneNumber,
      stylistPhone: originalBooking.stylist.phoneNumber,
      newDate: newBooking.bookingDate.toISOString().split('T')[0],
      newStartTime: newBooking.startTime,
      newEndTime: newBooking.endTime,
    };

    // Send reschedule SMS to customer
    await this.otpService.sendBookingReschedule(
      originalBooking.customer.phoneNumber,
      bookingDetails,
    );
  }
}
