import { SmsServiceInterface } from '../../common/interfaces/sms-service.interface';

export interface OtpServiceInterface extends SmsServiceInterface {
  // The interface now extends SmsServiceInterface, so it includes all SMS methods
}
