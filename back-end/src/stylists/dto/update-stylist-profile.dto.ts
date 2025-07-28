import { PartialType } from '@nestjs/mapped-types';
import { CreateStylistProfileDto } from './create-stylist-profile.dto';

export class UpdateStylistProfileDto extends PartialType(
  CreateStylistProfileDto,
) {}
