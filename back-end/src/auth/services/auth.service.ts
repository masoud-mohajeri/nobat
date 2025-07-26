import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Otp } from '../entities/otp.entity';
import { OtpType } from '../../common/enums/otp-type.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { OtpServiceInterface } from '../interfaces/otp-service.interface';
import { SendOtpDto } from '../dto/send-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly jwtService: JwtService,
    @Inject('OTP_SERVICE')
    private readonly otpService: OtpServiceInterface,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    const { phoneNumber, type } = sendOtpDto;

    // Check if user exists for login OTP
    if (type === OtpType.LOGIN || type === OtpType.ACCOUNT_UNLOCK) {
      const user = await this.userRepository.findOne({
        where: { phoneNumber },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Generate OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    const otp = this.otpRepository.create({
      phoneNumber,
      code,
      type,
      expiresAt,
    });
    await this.otpRepository.save(otp);

    // Send OTP via SMS
    await this.otpService.sendOtp(phoneNumber, code);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string; user?: User }> {
    const { phoneNumber, code, type } = verifyOtpDto;

    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        phoneNumber,
        code,
        type,
        isUsed: false,
      },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    otp.isUsed = true;
    await this.otpRepository.save(otp);

    let user: User;

    if (type === OtpType.PHONE_VERIFICATION) {
      // Create new user or update existing one
      let existingUser = await this.userRepository.findOne({
        where: { phoneNumber },
      });

      if (!existingUser) {
        user = this.userRepository.create({
          phoneNumber,
          isPhoneVerified: true,
          phoneVerifiedAt: new Date(),
        });
      } else {
        existingUser.isPhoneVerified = true;
        existingUser.phoneVerifiedAt = new Date();
        user = existingUser;
      }

      await this.userRepository.save(user);
      return { message: 'Phone number verified successfully', user };
    }

    if (type === OtpType.LOGIN || type === OtpType.ACCOUNT_UNLOCK) {
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      user = existingUser;

      if (type === OtpType.ACCOUNT_UNLOCK) {
        user.status = UserStatus.ACTIVE;
        user.failedLoginAttempts = 0;
        await this.userRepository.save(user);
        return { message: 'Account unlocked successfully', user };
      }

      // For login OTP, return user for token generation
      return { message: 'OTP verified successfully', user };
    }

    return { message: 'OTP verified successfully' };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { phoneNumber, password, otpCode } = loginDto;

    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if account is locked
    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException(
        'Account is locked. Please use OTP to unlock.',
      );
    }

    let isValidLogin = false;

    if (otpCode) {
      // OTP login
      const otp = await this.otpRepository.findOne({
        where: {
          phoneNumber,
          code: otpCode,
          type: OtpType.LOGIN,
          isUsed: false,
        },
      });

      if (otp && otp.expiresAt > new Date()) {
        otp.isUsed = true;
        await this.otpRepository.save(otp);
        isValidLogin = true;
      }
    } else if (password) {
      // Password login
      if (!user.password) {
        throw new BadRequestException('Password not set for this account');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        isValidLogin = true;
        user.failedLoginAttempts = 0;
      } else {
        user.failedLoginAttempts += 1;
        user.lastFailedLoginAt = new Date();

        if (user.failedLoginAttempts >= 3) {
          user.status = UserStatus.LOCKED;
        }

        await this.userRepository.save(user);
        throw new UnauthorizedException('Invalid password');
      }
    } else {
      throw new BadRequestException('Either password or OTP code is required');
    }

    if (!isValidLogin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return { accessToken, refreshToken, user };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokenEntity = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, isRevoked: false },
        relations: ['user'],
      });

      if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke current refresh token
      tokenEntity.isRevoked = true;
      tokenEntity.reasonRevoked = 'replaced';
      await this.refreshTokenRepository.save(tokenEntity);

      // Generate new tokens
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.generateAccessToken(tokenEntity.user),
        this.generateRefreshToken(tokenEntity.user),
      ]);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenEntity) {
      tokenEntity.isRevoked = true;
      tokenEntity.reasonRevoked = 'logout';
      await this.refreshTokenRepository.save(tokenEntity);
    }

    return { message: 'Logged out successfully' };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '30m',
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const token = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '30d',
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token,
      userId: user.id,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return token;
  }
}
