import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { UserStatus } from '../../common/enums/user-status.enum';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import { SetPasswordDto } from '../dto/set-password.dto';
import { CreateCustomerProfileDto } from '../dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { ChangePhoneDto } from '../dto/change-phone.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phoneNumber },
    });
  }

  async completeProfile(
    userId: string,
    completeProfileDto: CompleteProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException('Profile already completed');
    }

    // Update user profile
    Object.assign(user, {
      ...completeProfileDto,
      status: UserStatus.ACTIVE,
    });

    if (completeProfileDto.birthDate) {
      user.birthDate = new Date(completeProfileDto.birthDate);
    }

    return this.userRepository.save(user);
  }

  async setPassword(
    userId: string,
    setPasswordDto: SetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    if (user.password) {
      throw new BadRequestException('Password already set');
    }

    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 12);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return { message: 'Password set successfully' };
  }

  async getProfile(userId: string): Promise<User> {
    return this.findById(userId);
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }

  // Customer Profile Methods
  async createCustomerProfile(
    userId: string,
    createCustomerProfileDto: CreateCustomerProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Check if user is already a customer (USER role)
    if (user.role !== 'user') {
      throw new BadRequestException(
        'Only customers can create customer profiles',
      );
    }

    // Check if profile is already completed
    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Customer profile already exists');
    }

    // Update user profile
    Object.assign(user, {
      ...createCustomerProfileDto,
      status: UserStatus.ACTIVE,
    });

    if (createCustomerProfileDto.birthDate) {
      user.birthDate = new Date(createCustomerProfileDto.birthDate);
    }

    return this.userRepository.save(user);
  }

  async getCustomerProfile(userId: string): Promise<User> {
    const user = await this.findById(userId);

    // Check if user is a customer
    if (user.role !== 'user') {
      throw new BadRequestException(
        'Only customers can access customer profiles',
      );
    }

    return user;
  }

  async updateCustomerProfile(
    userId: string,
    updateCustomerProfileDto: UpdateCustomerProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Check if user is a customer
    if (user.role !== 'user') {
      throw new BadRequestException(
        'Only customers can update customer profiles',
      );
    }

    // Update only provided fields
    if (updateCustomerProfileDto.firstName !== undefined) {
      user.firstName = updateCustomerProfileDto.firstName;
    }
    if (updateCustomerProfileDto.lastName !== undefined) {
      user.lastName = updateCustomerProfileDto.lastName;
    }
    if (updateCustomerProfileDto.birthDate !== undefined) {
      user.birthDate = new Date(updateCustomerProfileDto.birthDate);
    }

    return this.userRepository.save(user);
  }

  async changeCustomerPhone(
    userId: string,
    changePhoneDto: ChangePhoneDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    // Check if user is a customer
    if (user.role !== 'user') {
      throw new BadRequestException('Only customers can change phone numbers');
    }

    const { newPhoneNumber } = changePhoneDto;

    // Check if new phone number already exists
    const existingUser = await this.findByPhoneNumber(newPhoneNumber);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Phone number already in use');
    }

    // Update phone number
    user.phoneNumber = newPhoneNumber;
    user.isPhoneVerified = false; // Require re-verification
    user.phoneVerifiedAt = undefined;

    await this.userRepository.save(user);

    return {
      message:
        'Phone number updated successfully. Please verify your new phone number with OTP.',
    };
  }

  // Method for stylists to get customer information (name and phone only)
  async getCustomerInfoForStylist(customerId: string): Promise<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }> {
    const user = await this.findById(customerId);

    // Check if user is a customer
    if (user.role !== 'user') {
      throw new BadRequestException('User is not a customer');
    }

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber,
    };
  }
}
