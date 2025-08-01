import { Injectable, Logger } from '@nestjs/common';
import {
  SmsServiceInterface,
  BookingSmsDetails,
} from '../interfaces/sms-service.interface';

@Injectable()
export class SmsService implements SmsServiceInterface {
  private readonly logger = new Logger(SmsService.name);

  // OTP functionality (existing)
  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your Nobat verification code is: ${code}. Valid for 5 minutes.`;
    return this.sendSms(phoneNumber, message);
  }

  // Booking confirmation for customer
  async sendBookingConfirmation(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    const message = this.formatBookingConfirmationMessage(bookingDetails);
    return this.sendSms(phoneNumber, message);
  }

  // 24h reminder for customer
  async sendBookingReminder(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    const message = this.formatBookingReminderMessage(bookingDetails);
    return this.sendSms(phoneNumber, message);
  }

  // Booking cancellation notification
  async sendBookingCancellation(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    const message = this.formatBookingCancellationMessage(bookingDetails);
    return this.sendSms(phoneNumber, message);
  }

  // Booking reschedule notification
  async sendBookingReschedule(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    const message = this.formatBookingRescheduleMessage(bookingDetails);
    return this.sendSms(phoneNumber, message);
  }

  // New booking notification for stylist
  async sendStylistNotification(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean> {
    const message = this.formatStylistNotificationMessage(bookingDetails);
    return this.sendSms(phoneNumber, message);
  }

  // Generic SMS method
  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In production, this would send SMS via a service like Twilio or Kavenegar
      this.logger.log(`Mock SMS sent to ${phoneNumber}: ${message}`);

      // Simulate successful SMS delivery
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phoneNumber}: ${error.message}`,
      );
      return false;
    }
  }

  // Private methods for message formatting
  private formatBookingConfirmationMessage(details: BookingSmsDetails): string {
    const date = new Date(details.bookingDate).toLocaleDateString('fa-IR');
    const time = details.startTime;
    const stylistName = details.stylistName;
    const salonAddress = details.salonAddress || 'آدرس سالن';

    let message = `✅ رزرو شما تایید شد\n\n`;
    message += `📅 تاریخ: ${date}\n`;
    message += `🕐 ساعت: ${time}\n`;
    message += `👩‍🎨 آرایشگر: ${stylistName}\n`;
    message += `📍 آدرس: ${salonAddress}\n\n`;

    if (details.depositAmount) {
      message += `💰 پیش پرداخت: ${details.depositAmount.toLocaleString()} تومان\n`;
    }

    message += `📞 شماره رزرو: ${details.bookingId}\n\n`;
    message += `یادآوری 24 ساعته قبل از نوبت ارسال خواهد شد.`;

    return message;
  }

  private formatBookingReminderMessage(details: BookingSmsDetails): string {
    const date = new Date(details.bookingDate).toLocaleDateString('fa-IR');
    const time = details.startTime;
    const stylistName = details.stylistName;
    const salonAddress = details.salonAddress || 'آدرس سالن';

    let message = `⏰ یادآوری نوبت\n\n`;
    message += `فردا ساعت ${time} نوبت شما نزد ${stylistName} است.\n\n`;
    message += `📅 تاریخ: ${date}\n`;
    message += `🕐 ساعت: ${time}\n`;
    message += `📍 آدرس: ${salonAddress}\n`;
    message += `📞 شماره رزرو: ${details.bookingId}\n\n`;
    message += `لطفا 10 دقیقه قبل از وقت مقرر حضور داشته باشید.`;

    return message;
  }

  private formatBookingCancellationMessage(details: BookingSmsDetails): string {
    const date = new Date(details.bookingDate).toLocaleDateString('fa-IR');
    const time = details.startTime;
    const reason = details.cancellationReason || 'دلایل فنی';

    let message = `❌ لغو نوبت\n\n`;
    message += `نوبت شما در تاریخ ${date} ساعت ${time} لغو شده است.\n\n`;
    message += `📞 شماره رزرو: ${details.bookingId}\n`;
    message += `📝 دلیل: ${reason}\n\n`;
    message += `برای رزرو مجدد با ما تماس بگیرید.`;

    return message;
  }

  private formatBookingRescheduleMessage(details: BookingSmsDetails): string {
    const oldDate = new Date(details.bookingDate).toLocaleDateString('fa-IR');
    const oldTime = details.startTime;
    const newDate = details.newDate
      ? new Date(details.newDate).toLocaleDateString('fa-IR')
      : '';
    const newTime = details.newStartTime || '';

    let message = `🔄 تغییر نوبت\n\n`;
    message += `نوبت شما تغییر یافته است:\n\n`;
    message += `❌ تاریخ قبلی: ${oldDate} ساعت ${oldTime}\n`;
    message += `✅ تاریخ جدید: ${newDate} ساعت ${newTime}\n`;
    message += `📞 شماره رزرو: ${details.bookingId}\n\n`;
    message += `در صورت عدم موافقت، لطفا با ما تماس بگیرید.`;

    return message;
  }

  private formatStylistNotificationMessage(details: BookingSmsDetails): string {
    const date = new Date(details.bookingDate).toLocaleDateString('fa-IR');
    const time = details.startTime;
    const customerName = details.customerName;
    const customerPhone = details.customerPhone || '';

    let message = `📱 نوبت جدید\n\n`;
    message += `نوبت جدید برای شما ثبت شده است:\n\n`;
    message += `📅 تاریخ: ${date}\n`;
    message += `🕐 ساعت: ${time}\n`;
    message += `👤 مشتری: ${customerName}\n`;

    if (customerPhone) {
      message += `📞 تلفن: ${customerPhone}\n`;
    }

    message += `📞 شماره رزرو: ${details.bookingId}\n\n`;
    message += `لطفا نوبت را تایید یا رد کنید.`;

    return message;
  }
}
