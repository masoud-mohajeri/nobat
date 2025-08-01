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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StylistsService } from '../services/stylists.service';
import { CreateStylistProfileDto } from '../dto/create-stylist-profile.dto';
import { UpdateStylistProfileDto } from '../dto/update-stylist-profile.dto';
import { AdminApproveProfileDto } from '../dto/admin-approve-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StylistRoleGuard } from '../guards/stylist-role.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';

@ApiTags('stylists')
@Controller('api/v1/stylists')
export class StylistsController {
  constructor(private readonly stylistsService: StylistsService) {}

  // Stylist endpoints (authenticated + stylist role)
  @ApiOperation({ summary: 'Create stylist profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Get own stylist profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  async getOwnProfile(@CurrentUser() user: any) {
    return this.stylistsService.getOwnProfile(user.userId);
  }

  @ApiOperation({ summary: 'Update stylist profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Submit profile for admin approval' })
  @ApiResponse({ status: 200, description: 'Profile submitted for approval' })
  @ApiResponse({ status: 400, description: 'Profile not ready for submission' })
  @ApiBearerAuth('JWT-auth')
  @Post('profile/submit')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  @HttpCode(HttpStatus.OK)
  async submitForApproval(@CurrentUser() user: any) {
    return this.stylistsService.submitForApproval(user.userId);
  }

  @ApiOperation({ summary: 'Delete stylist profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiBearerAuth('JWT-auth')
  @Delete('profile')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  @HttpCode(HttpStatus.OK)
  async deleteProfile(@CurrentUser() user: any) {
    return this.stylistsService.deleteProfile(user.userId);
  }

  // Public endpoints (no authentication required)
  @ApiOperation({ summary: 'Get public stylist profile' })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Stylist not found' })
  @ApiParam({ name: 'id', description: 'Stylist ID' })
  @Get(':id/profile')
  async getPublicProfile(@Param('id') stylistId: string) {
    return this.stylistsService.getPublicProfile(stylistId);
  }

  // Admin endpoints (authenticated + admin role)
  @ApiOperation({ summary: 'Get all stylist profiles (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All profiles retrieved successfully',
  })
  @ApiBearerAuth('JWT-auth')
  @Get('admin/profiles')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getAllProfilesForAdmin(@CurrentUser() user: any) {
    return this.stylistsService.getAllProfilesForAdmin();
  }

  @ApiOperation({ summary: 'Get stylist profiles by status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Profiles retrieved successfully' })
  @ApiParam({
    name: 'status',
    description: 'Profile status',
    enum: StylistProfileStatus,
  })
  @ApiBearerAuth('JWT-auth')
  @Get('admin/profiles/status/:status')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getProfilesByStatus(
    @CurrentUser() user: any,
    @Param('status') status: StylistProfileStatus,
  ) {
    return this.stylistsService.getProfilesByStatus(status);
  }

  @ApiOperation({ summary: 'Approve or reject stylist profile (Admin only)' })
  @ApiResponse({ status: 200, description: 'Profile approval status updated' })
  @ApiResponse({ status: 400, description: 'Invalid approval data' })
  @ApiResponse({ status: 404, description: 'Stylist not found' })
  @ApiParam({ name: 'id', description: 'Stylist ID' })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({ summary: 'Suspend stylist profile (Admin only)' })
  @ApiResponse({ status: 200, description: 'Profile suspended successfully' })
  @ApiResponse({ status: 404, description: 'Stylist not found' })
  @ApiParam({ name: 'id', description: 'Stylist ID' })
  @ApiBearerAuth('JWT-auth')
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
