import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Otp } from '../src/auth/entities/otp.entity';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface TestUser {
  id: string;
  phoneNumber: string;
  accessToken?: string;
  refreshToken?: string;
}

export class TestHelper {
  static app: INestApplication;
  static userRepository: Repository<User>;
  static otpRepository: Repository<Otp>;
  static refreshTokenRepository: Repository<RefreshToken>;

  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'nobat_user',
          password: process.env.DB_PASSWORD || 'nobat_password',
          database: process.env.DB_DATABASE || 'nobat_db_test',
          entities: [User, Otp, RefreshToken],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();

    // Get repositories for test utilities
    this.userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    this.otpRepository = moduleFixture.get<Repository<Otp>>(
      getRepositoryToken(Otp),
    );
    this.refreshTokenRepository = moduleFixture.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );

    return this.app;
  }

  static generateTestPhoneNumber(): string {
    return `09${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0')}`;
  }

  static async createVerifiedUser(phoneNumber: string): Promise<TestUser> {
    // Send OTP
    await request(this.app.getHttpServer()).post('/api/v1/auth/send-otp').send({
      phoneNumber,
      type: 'phone_verification',
    });

    // Verify OTP (using mock OTP for testing)
    const verifyResponse = await request(this.app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({
        phoneNumber,
        code: '123456',
        type: 'phone_verification',
      });

    return {
      id: verifyResponse.body.user.id,
      phoneNumber,
    };
  }

  static async createActiveUser(phoneNumber: string): Promise<TestUser> {
    const user = await this.createVerifiedUser(phoneNumber);

    // Complete profile
    await request(this.app.getHttpServer())
      .post('/api/v1/users/complete-profile')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
        role: 'user',
      });

    // Set password
    await request(this.app.getHttpServer())
      .post('/api/v1/users/set-password')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        password: 'TestPassword123',
      });

    // Login to get tokens
    const loginResponse = await request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        phoneNumber,
        password: 'TestPassword123',
      });

    return {
      ...user,
      accessToken: loginResponse.body.accessToken,
      refreshToken: loginResponse.body.refreshToken,
    };
  }

  static async cleanupTestData(): Promise<void> {
    if (this.refreshTokenRepository) {
      await this.refreshTokenRepository.clear();
    }
    if (this.otpRepository) {
      await this.otpRepository.clear();
    }
    if (this.userRepository) {
      await this.userRepository.clear();
    }
  }

  static async closeTestApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}
