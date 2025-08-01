import { IsString, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '../../common/enums/otp-type.enum';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number in 11-digit format (09XXXXXXXXX)',
    example: '09123456789',
    pattern: '^09\\d{9}$',
  })
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be 11 digits starting with 09',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Type of OTP to send',
    enum: OtpType,
    example: OtpType.PHONE_VERIFICATION,
  })
  @IsEnum(OtpType)
  type: OtpType;
}
