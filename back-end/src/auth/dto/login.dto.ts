import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
    description: 'Password (optional for OTP login)',
    example: 'MyPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'OTP code for login (optional for password login)',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  otpCode?: string;
}
