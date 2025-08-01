import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { StylistProfile } from '../../stylists/entities/stylist-profile.entity';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { OtpServiceInterface } from '../../auth/interfaces/otp-service.interface';
import { BookingSmsDetails } from '../../common/interfaces/sms-service.interface';

@Injectable()
export class BookingReminderService {
  private readonly logger = new Logger(BookingReminderService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StylistProfile)
    private readonly stylistProfileRepository: Repository<StylistProfile>,
    private readonly otpService: OtpServiceInterface,
  ) {}

  // Run every hour to check for bookings that need reminders
  // @Cron(CronExpression.EVERY_HOUR) // Uncomment when @nestjs/schedule is installed
  async sendBookingReminders() {
    this.logger.log('Checking for bookings that need 24h reminders...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Find bookings for tomorrow that haven't had reminders sent yet
    const bookings = await this.bookingRepository.find({
      where: {
        bookingDate: MoreThan(tomorrowStart),
        status: BookingStatus.CONFIRMED,
      },
      relations: ['stylist', 'customer'],
    });

    // Filter bookings for tomorrow that haven't had reminders sent
    const tomorrowBookings = bookings.filter(
      (booking) =>
        booking.bookingDate >= tomorrowStart &&
        booking.bookingDate <= tomorrowEnd &&
        !booking.reminderSentAt,
    );

    this.logger.log(
      `Found ${tomorrowBookings.length} bookings needing reminders`,
    );

    for (const booking of tomorrowBookings) {
      await this.sendReminderForBooking(booking);
    }
  }

  private async sendReminderForBooking(booking: Booking): Promise<void> {
    try {
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

      // Send reminder to customer
      const success = await this.otpService.sendBookingReminder(
        booking.customer.phoneNumber,
        bookingDetails,
      );

      if (success) {
        // Mark reminder as sent
        booking.reminderSentAt = new Date();
        await this.bookingRepository.save(booking);

        this.logger.log(`Reminder sent for booking ${booking.id}`);
      } else {
        this.logger.error(`Failed to send reminder for booking ${booking.id}`);
      }
    } catch (error) {
      this.logger.error(
        `Error sending reminder for booking ${booking.id}: ${error.message}`,
      );
    }
  }

  // Manual method to send reminder for a specific booking
  async sendManualReminder(bookingId: string): Promise<boolean> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['stylist', 'customer'],
      });

      if (!booking) {
        this.logger.error(`Booking ${bookingId} not found`);
        return false;
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        this.logger.error(`Booking ${bookingId} is not confirmed`);
        return false;
      }

      await this.sendReminderForBooking(booking);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending manual reminder for booking ${bookingId}: ${error.message}`,
      );
      return false;
    }
  }
}
