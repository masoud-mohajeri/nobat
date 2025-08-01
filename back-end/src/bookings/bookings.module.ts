import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './controllers/bookings.controller';
import { StylistBookingsController } from './controllers/stylist-bookings.controller';
import { PublicBookingsController } from './controllers/public-bookings.controller';
import { BookingsService } from './services/bookings.service';
import { BookingReminderService } from './services/booking-reminder.service';
import { Booking } from './entities/booking.entity';
import { StylistAvailability } from './entities/stylist-availability.entity';
import { StylistException } from './entities/stylist-exception.entity';
import { User } from '../users/entities/user.entity';
import { StylistProfile } from '../stylists/entities/stylist-profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      StylistAvailability,
      StylistException,
      User,
      StylistProfile,
    ]),
    AuthModule,
  ],
  controllers: [
    BookingsController,
    StylistBookingsController,
    PublicBookingsController,
  ],
  providers: [BookingsService, BookingReminderService],
  exports: [BookingsService, BookingReminderService],
})
export class BookingsModule {}
