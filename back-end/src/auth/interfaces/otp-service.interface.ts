export interface OtpServiceInterface {
  sendOtp(phoneNumber: string, code: string): Promise<boolean>;
}
