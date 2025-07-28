import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { StylistsService } from '../services/stylists.service';
import { CreateStylistProfileDto } from '../dto/create-stylist-profile.dto';
import { UpdateStylistProfileDto } from '../dto/update-stylist-profile.dto';
import { AdminApproveProfileDto } from '../dto/admin-approve-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StylistRoleGuard } from '../guards/stylist-role.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';

@Controller('api/v1/stylists')
export class StylistsController {
  constructor(private readonly stylistsService: StylistsService) {}

  // Stylist endpoints (authenticated + stylist role)
  @Post('profile')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @CurrentUser() user: any,
    @Body() createStylistProfileDto: CreateStylistProfileDto,
  ) {
    return this.stylistsService.createProfile(
      user.userId,
      createStylistProfileDto,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  async getOwnProfile(@CurrentUser() user: any) {
    return this.stylistsService.getOwnProfile(user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateStylistProfileDto: UpdateStylistProfileDto,
  ) {
    return this.stylistsService.updateProfile(
      user.userId,
      updateStylistProfileDto,
    );
  }

  @Post('profile/submit')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  @HttpCode(HttpStatus.OK)
  async submitForApproval(@CurrentUser() user: any) {
    return this.stylistsService.submitForApproval(user.userId);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  @HttpCode(HttpStatus.OK)
  async deleteProfile(@CurrentUser() user: any) {
    return this.stylistsService.deleteProfile(user.userId);
  }

  // Public endpoints (no authentication required)
  @Get(':id/profile')
  async getPublicProfile(@Param('id') stylistId: string) {
    return this.stylistsService.getPublicProfile(stylistId);
  }

  // Admin endpoints (authenticated + admin role)
  @Get('admin/profiles')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getAllProfilesForAdmin(@CurrentUser() user: any) {
    return this.stylistsService.getAllProfilesForAdmin();
  }

  @Get('admin/profiles/status/:status')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getProfilesByStatus(
    @CurrentUser() user: any,
    @Param('status') status: StylistProfileStatus,
  ) {
    return this.stylistsService.getProfilesByStatus(status);
  }

  @Post('admin/profiles/:id/approve')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  async adminApproveProfile(
    @CurrentUser() user: any,
    @Param('id') stylistId: string,
    @Body() adminApproveProfileDto: AdminApproveProfileDto,
  ) {
    return this.stylistsService.adminApproveProfile(
      user.userId,
      stylistId,
      adminApproveProfileDto,
    );
  }

  @Post('admin/profiles/:id/suspend')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @HttpCode(HttpStatus.OK)
  async adminSuspendProfile(
    @CurrentUser() user: any,
    @Param('id') stylistId: string,
    @Body() body: { reason?: string },
  ) {
    return this.stylistsService.adminSuspendProfile(
      user.userId,
      stylistId,
      body.reason,
    );
  }
}
