import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPasswordDto {
  @ApiProperty({
    description:
      'User password (minimum 8 characters, must contain uppercase and lowercase letters)',
    example: 'MyPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])/, {
    message:
      'Password must contain at least one lowercase and one uppercase letter',
  })
  password: string;
}
