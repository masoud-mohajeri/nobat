export interface SmsServiceInterface {
  // OTP functionality (existing)
  sendOtp(phoneNumber: string, code: string): Promise<boolean>;

  // Booking notifications
  sendBookingConfirmation(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean>;
  sendBookingReminder(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean>;
  sendBookingCancellation(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean>;
  sendBookingReschedule(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean>;
  sendStylistNotification(
    phoneNumber: string,
    bookingDetails: BookingSmsDetails,
  ): Promise<boolean>;

  // Generic SMS
  sendSms(phoneNumber: string, message: string): Promise<boolean>;
}

export interface BookingSmsDetails {
  bookingId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  stylistName: string;
  customerName: string;
  salonAddress?: string;
  customerPhone?: string;
  stylistPhone?: string;
  depositAmount?: number;
  totalAmount?: number;
  cancellationReason?: string;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
}
