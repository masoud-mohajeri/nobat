import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StylistsService } from '../services/stylists.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('api/v1/stylists')
export class BookingLinksController {
  constructor(private readonly stylistsService: StylistsService) {}

  @Post('profile/regenerate-link')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async regenerateBookingLink(@CurrentUser() user: any) {
    // This is a placeholder for future implementation
    // The booking link structure will be /book/{stylistId}/
    const profile = await this.stylistsService.getOwnProfile(user.userId);

    return {
      message: 'Booking link regenerated successfully',
      bookingLink: `/book/${profile.id}/`,
    };
  }
}
