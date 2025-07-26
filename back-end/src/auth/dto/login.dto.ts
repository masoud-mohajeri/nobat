import { IsString, IsOptional, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be 11 digits starting with 09',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  otpCode?: string;
}
