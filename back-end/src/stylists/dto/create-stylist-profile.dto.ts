import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStylistProfileDto {
  @ApiProperty({
    description: 'Salon address',
    example: 'تهران، خیابان ولیعصر، پلاک 123',
  })
  @IsString()
  salonAddress: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 35.7219,
    minimum: -90,
    maximum: 90,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 51.3347,
    minimum: -180,
    maximum: 180,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({
    description: 'Instagram username',
    example: 'stylist_iran',
    required: false,
  })
  @IsOptional()
  @IsString()
  instagramUsername?: string;
}
