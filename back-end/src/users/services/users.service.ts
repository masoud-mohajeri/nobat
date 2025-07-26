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
}
