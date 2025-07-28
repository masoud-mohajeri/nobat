import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateCustomerProfileDto } from '../dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { ChangePhoneDto } from '../dto/change-phone.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CustomerRoleGuard } from '../guards/customer-role.guard';
import { StylistRoleGuard } from '../../stylists/guards/stylist-role.guard';
import { AdminRoleGuard } from '../../stylists/guards/admin-role.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('api/v1/customers')
@UseGuards(JwtAuthGuard, CustomerRoleGuard)
export class CustomersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  async createCustomerProfile(
    @CurrentUser() user: any,
    @Body() createCustomerProfileDto: CreateCustomerProfileDto,
  ) {
    return this.usersService.createCustomerProfile(
      user.userId,
      createCustomerProfileDto,
    );
  }

  @Get('profile')
  async getCustomerProfile(@CurrentUser() user: any) {
    return this.usersService.getCustomerProfile(user.userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateCustomerProfile(
    @CurrentUser() user: any,
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
  ) {
    return this.usersService.updateCustomerProfile(
      user.userId,
      updateCustomerProfileDto,
    );
  }

  @Post('profile/change-phone')
  @HttpCode(HttpStatus.OK)
  async changePhone(
    @CurrentUser() user: any,
    @Body() changePhoneDto: ChangePhoneDto,
  ) {
    return this.usersService.changeCustomerPhone(user.userId, changePhoneDto);
  }

  // Endpoint for stylists to get customer information (name and phone only)
  @Get(':customerId/info')
  @UseGuards(JwtAuthGuard, StylistRoleGuard)
  async getCustomerInfo(
    @CurrentUser() user: any,
    @Param('customerId') customerId: string,
  ) {
    return this.usersService.getCustomerInfoForStylist(customerId);
  }
}
