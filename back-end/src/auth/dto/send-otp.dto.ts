import { IsString, IsEnum, Matches } from 'class-validator';
import { OtpType } from '../../common/enums/otp-type.enum';

export class SendOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be 11 digits starting with 09',
  })
  phoneNumber: string;

  @IsEnum(OtpType)
  type: OtpType;
}
