# SMS Service for Booking System

## Overview

The SMS service has been extended to support comprehensive booking notifications. It provides structured, localized messages for various booking events including confirmations, reminders, cancellations, and reschedules.

## Features

### ✅ Implemented Features

1. **Booking Confirmation SMS** - Sent to customers when booking is created
2. **Stylist Notification SMS** - Sent to stylists when new booking is received
3. **24-Hour Reminder SMS** - Sent to customers 24 hours before appointment
4. **Cancellation SMS** - Sent to customers when booking is cancelled
5. **Reschedule SMS** - Sent to customers when booking is rescheduled
6. **Persian/Farsi Localization** - All messages are in Persian with proper formatting
7. **Structured Message Templates** - Consistent formatting with emojis and clear information

### 🔧 Technical Implementation

#### SMS Service Interface

```typescript
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
```

#### Booking SMS Details Structure

```typescript
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
```

## Message Templates

### 1. Booking Confirmation (Customer)

```
✅ رزرو شما تایید شد

📅 تاریخ: 1403/10/05
🕐 ساعت: 14:00
👩‍🎨 آرایشگر: سارا احمدی
📍 آدرس: تهران، خیابان ولیعصر

💰 پیش پرداخت: 50,000 تومان
📞 شماره رزرو: abc123

یادآوری 24 ساعته قبل از نوبت ارسال خواهد شد.
```

### 2. Stylist Notification

```
📱 نوبت جدید

نوبت جدید برای شما ثبت شده است:

📅 تاریخ: 1403/10/05
🕐 ساعت: 14:00
👤 مشتری: مریم محمدی
📞 تلفن: 09123456789
📞 شماره رزرو: abc123

لطفا نوبت را تایید یا رد کنید.
```

### 3. 24-Hour Reminder

```
⏰ یادآوری نوبت

فردا ساعت 14:00 نوبت شما نزد سارا احمدی است.

📅 تاریخ: 1403/10/05
🕐 ساعت: 14:00
📍 آدرس: تهران، خیابان ولیعصر
📞 شماره رزرو: abc123

لطفا 10 دقیقه قبل از وقت مقرر حضور داشته باشید.
```

### 4. Cancellation Notification

```
❌ لغو نوبت

نوبت شما در تاریخ 1403/10/05 ساعت 14:00 لغو شده است.

📞 شماره رزرو: abc123
📝 دلیل: آرایشگر در دسترس نیست

برای رزرو مجدد با ما تماس بگیرید.
```

### 5. Reschedule Notification

```
🔄 تغییر نوبت

نوبت شما تغییر یافته است:

❌ تاریخ قبلی: 1403/10/05 ساعت 14:00
✅ تاریخ جدید: 1403/10/06 ساعت 15:00
📞 شماره رزرو: abc123

در صورت عدم موافقت، لطفا با ما تماس بگیرید.
```

## Integration Points

### 1. Booking Service Integration

The SMS service is integrated into the `BookingsService` for automatic notifications:

- **Booking Creation**: Sends confirmation to customer and notification to stylist
- **Booking Cancellation**: Sends cancellation notification to customer
- **Booking Reschedule**: Sends reschedule notification to customer

### 2. Reminder Service Integration

The `BookingReminderService` handles 24-hour reminders:

- **Scheduled Reminders**: Runs every hour to check for upcoming bookings
- **Manual Reminders**: Can be triggered manually for specific bookings
- **Reminder Tracking**: Marks reminders as sent to prevent duplicates

## Usage Examples

### Sending Booking Confirmation

```typescript
const bookingDetails: BookingSmsDetails = {
  bookingId: 'abc123',
  bookingDate: '2024-12-26',
  startTime: '14:00',
  endTime: '15:00',
  stylistName: 'سارا احمدی',
  customerName: 'مریم محمدی',
  salonAddress: 'تهران، خیابان ولیعصر',
  customerPhone: '09123456789',
  depositAmount: 50000,
};

await smsService.sendBookingConfirmation(
  bookingDetails.customerPhone,
  bookingDetails,
);
```

### Sending Stylist Notification

```typescript
await smsService.sendStylistNotification(stylistPhone, bookingDetails);
```

### Sending Reminder

```typescript
await smsService.sendBookingReminder(customerPhone, bookingDetails);
```

## Configuration

### Current Implementation

- **Mock SMS Service**: Logs messages to console for development
- **Persian Localization**: All messages are in Persian/Farsi
- **Structured Formatting**: Uses emojis and clear sections

### Production Setup

To use a real SMS service in production:

1. **Install SMS Provider Package**:

   ```bash
   npm install @nestjs/schedule  # For scheduled reminders
   ```

2. **Configure SMS Provider** (e.g., Twilio, Kavenegar):

   ```typescript
   // Example with Twilio
   import { Twilio } from 'twilio';

   const twilio = new Twilio(accountSid, authToken);

   async sendSms(phoneNumber: string, message: string): Promise<boolean> {
     try {
       await twilio.messages.create({
         body: message,
         from: twilioPhoneNumber,
         to: phoneNumber
       });
       return true;
     } catch (error) {
       this.logger.error(`SMS send failed: ${error.message}`);
       return false;
     }
   }
   ```

3. **Environment Variables**:

   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number

   # Kavenegar Configuration (Alternative)
   KAVENEGAR_API_KEY=your_api_key
   KAVENEGAR_SENDER=your_sender_number
   ```

## Testing

### Test Scripts

1. **`scripts/test-sms-service.sh`**: Tests all SMS notification types
2. **`scripts/test-booking-system.sh`**: Tests complete booking flow with SMS

### Manual Testing

```bash
# Test SMS service
chmod +x scripts/test-sms-service.sh
./scripts/test-sms-service.sh

# Test complete booking system
chmod +x scripts/test-booking-system.sh
./scripts/test-booking-system.sh
```

### Expected Log Output

```
[MockOtpService] Mock booking confirmation SMS sent to 09123456789
[MockOtpService] Mock stylist notification SMS sent to 09987654321
[MockOtpService] Mock booking reminder SMS sent to 09123456789
[MockOtpService] Mock booking cancellation SMS sent to 09123456789
[MockOtpService] Mock booking reschedule SMS sent to 09123456789
```

## Future Enhancements

### Planned Features

- [ ] **Email Notifications**: Send email notifications alongside SMS
- [ ] **Push Notifications**: Mobile app push notifications
- [ ] **Template Customization**: Allow stylists to customize message templates
- [ ] **Multi-language Support**: Support for English and other languages
- [ ] **SMS Delivery Tracking**: Track SMS delivery status
- [ ] **Rate Limiting**: Prevent SMS spam
- [ ] **SMS Analytics**: Track SMS usage and delivery rates

### Technical Improvements

- [ ] **Message Queue**: Use Redis/RabbitMQ for reliable SMS delivery
- [ ] **Retry Logic**: Automatic retry for failed SMS
- [ ] **SMS Templates**: Database-stored templates for easy customization
- [ ] **Bulk SMS**: Send multiple SMS efficiently
- [ ] **SMS Scheduling**: Schedule SMS for specific times

## Troubleshooting

### Common Issues

1. **SMS Not Sending**:
   - Check phone number format (should be 11 digits: 09XXXXXXXXX)
   - Verify SMS service configuration
   - Check server logs for error messages

2. **Duplicate Reminders**:
   - Ensure `reminderSentAt` field is properly updated
   - Check reminder service scheduling

3. **Message Format Issues**:
   - Verify Persian text encoding
   - Check emoji compatibility with SMS provider

### Debug Mode

Enable debug logging to see detailed SMS service activity:

```typescript
// In your service
this.logger.debug(`Sending SMS to ${phoneNumber}: ${message}`);
```

## Security Considerations

1. **Phone Number Validation**: All phone numbers are validated before sending
2. **Rate Limiting**: Implement rate limiting to prevent SMS abuse
3. **Sensitive Data**: Avoid sending sensitive information via SMS
4. **Opt-out Support**: Allow customers to opt out of SMS notifications

## Performance Optimization

1. **Async Processing**: SMS sending is non-blocking
2. **Batch Processing**: Group multiple SMS for efficient sending
3. **Caching**: Cache frequently used templates
4. **Connection Pooling**: Reuse SMS provider connections

---

**Note**: This SMS service is currently implemented with mock functionality for development. For production use, integrate with a real SMS provider like Twilio, Kavenegar, or similar services.
