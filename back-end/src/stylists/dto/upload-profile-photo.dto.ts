import { IsOptional, IsString } from 'class-validator';

export class UploadProfilePhotoDto {
  @IsOptional()
  @IsString()
  description?: string;
}
