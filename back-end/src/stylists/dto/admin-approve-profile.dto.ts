import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';

export class AdminApproveProfileDto {
  @IsEnum(StylistProfileStatus)
  status: StylistProfileStatus.APPROVED | StylistProfileStatus.REJECTED;

  @IsOptional()
  @IsString()
  rejectionReason?: string; // Required if status is REJECTED
}
