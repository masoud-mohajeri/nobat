import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';

export class AdminApproveProfileDto {
  @ApiProperty({
    description: 'Profile approval status',
    enum: [StylistProfileStatus.APPROVED, StylistProfileStatus.REJECTED],
    example: StylistProfileStatus.APPROVED,
  })
  @IsEnum(StylistProfileStatus)
  status: StylistProfileStatus.APPROVED | StylistProfileStatus.REJECTED;

  @ApiProperty({
    description: 'Rejection reason (required if status is REJECTED)',
    example: 'Profile information incomplete',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string; // Required if status is REJECTED
}
