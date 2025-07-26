import { IsString, MinLength, Matches } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])/, {
    message:
      'Password must contain at least one lowercase and one uppercase letter',
  })
  password: string;
}
