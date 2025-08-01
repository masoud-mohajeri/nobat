import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StylistsService } from '../services/stylists.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('stylists')
@Controller('api/v1/stylists')
export class BookingLinksController {
  constructor(private readonly stylistsService: StylistsService) {}

  @ApiOperation({ summary: 'Regenerate booking link' })
  @ApiResponse({
    status: 200,
    description: 'Booking link regenerated successfully',
  })
  @ApiResponse({ status: 404, description: 'Stylist profile not found' })
  @ApiBearerAuth('JWT-auth')
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
