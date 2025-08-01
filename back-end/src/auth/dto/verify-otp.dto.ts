import { IsString, IsEnum, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '../../common/enums/otp-type.enum';

export class VerifyOtpDto {
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
    description: '6-digit OTP code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  code: string;

  @ApiProperty({
    description: 'Type of OTP to verify',
    enum: OtpType,
    example: OtpType.PHONE_VERIFICATION,
  })
  @IsEnum(OtpType)
  type: OtpType;
}
