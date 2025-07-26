import { Injectable, Logger } from '@nestjs/common';
import { OtpServiceInterface } from '../interfaces/otp-service.interface';

@Injectable()
export class MockOtpService implements OtpServiceInterface {
  private readonly logger = new Logger(MockOtpService.name);

  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    // In production, this would send SMS via a service like Twilio or Kavenegar
    this.logger.log(
      `Mock SMS sent to ${phoneNumber}: Your OTP code is ${code}`,
    );

    // Simulate successful SMS delivery
    return true;
  }
}
