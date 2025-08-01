import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePhotoDto {
  @ApiProperty({
    description: 'Photo description',
    example: 'Professional headshot',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
