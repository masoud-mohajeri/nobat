import { Injectable, Logger } from '@nestjs/common';
import { OtpServiceInterface } from '../interfaces/otp-service.interface';
import { BookingSmsDetails } from '../../common/interfaces/sms-service.interface';

@Injectable()
export class MockOtpService implements OtpServiceInterface {
  private readonly logger = new Logger(MockOtpService.name);

  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your Nobat verification code is: ${code}. Valid for 5 minutes.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendBookingConfirmation(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    this.logger.log(`Mock booking confirmation SMS sent to ${phoneNumber}`);
    return true;
  }

  async sendBookingReminder(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    this.logger.log(`Mock booking reminder SMS sent to ${phoneNumber}`);
    return true;
  }

  async sendBookingCancellation(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    this.logger.log(`Mock booking cancellation SMS sent to ${phoneNumber}`);
    return true;
  }

  async sendBookingReschedule(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    this.logger.log(`Mock booking reschedule SMS sent to ${phoneNumber}`);
    return true;
  }

  async sendStylistNotification(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    this.logger.log(`Mock stylist notification SMS sent to ${phoneNumber}`);
    return true;
  }

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    // In production, this would send SMS via a service like Twilio or Kavenegar
    this.logger.log(`Mock SMS sent to ${phoneNumber}: ${message}`);

    // Simulate successful SMS delivery
    return true;
  }
}
