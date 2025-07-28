import { IsString, Matches } from 'class-validator';

export class ChangePhoneDto {
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be 11 digits starting with 09',
  })
  newPhoneNumber: string;
}
