import { IsString, IsEnum, Matches, Length } from 'class-validator';
import { OtpType } from '../../common/enums/otp-type.enum';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be 11 digits starting with 09',
  })
  phoneNumber: string;

  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  code: string;

  @IsEnum(OtpType)
  type: OtpType;
}
