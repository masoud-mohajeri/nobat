import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import { SetPasswordDto } from '../dto/set-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @CurrentUser() user: any,
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    return this.usersService.completeProfile(user.userId, completeProfileDto);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setPassword(
    @CurrentUser() user: any,
    @Body() setPasswordDto: SetPasswordDto,
  ) {
    return this.usersService.setPassword(user.userId, setPasswordDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }
}
