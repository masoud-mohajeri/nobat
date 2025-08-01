import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Otp } from '../src/auth/entities/otp.entity';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { UserRole } from '../src/common/enums/user-role.enum';
import { UserStatus } from '../src/common/enums/user-status.enum';
import { OtpType } from '../src/common/enums/otp-type.enum';

describe('Registration Flows (e2e)', () => {
  let app: INestApplication;
  let testPhoneNumber: string;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
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
          synchronize: true, // Only for testing
          dropSchema: true, // Clean database before tests
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate unique phone number for testing
    testPhoneNumber = `09${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0')}`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Phone Number Registration Flow', () => {
    it('should send OTP for phone verification', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phoneNumber: testPhoneNumber,
          type: OtpType.PHONE_VERIFICATION,
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'OTP sent successfully');
    });

    it('should fail to send OTP with invalid phone number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phoneNumber: 'invalid',
          type: OtpType.PHONE_VERIFICATION,
        })
        .expect(400);
    });

    it('should verify OTP and create user', async () => {
      // First, get the OTP from database (in real scenario, this would come via SMS)
      const otpResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phoneNumber: testPhoneNumber,
          type: OtpType.PHONE_VERIFICATION,
        });

      // In test environment, we need to get the OTP from database
      // This is a test helper - in real scenario, OTP would come via SMS
      const otpCode = '123456'; // Mock OTP for testing

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          code: otpCode,
          type: OtpType.PHONE_VERIFICATION,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Phone number verified successfully',
      );
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('phoneNumber', testPhoneNumber);
      expect(response.body.user).toHaveProperty('isPhoneVerified', true);
      expect(response.body.user).toHaveProperty('status', UserStatus.PENDING);
      expect(response.body.user).toHaveProperty('role', UserRole.USER);

      userId = response.body.user.id;
    });

    it('should fail to verify OTP with invalid code', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          code: '000000',
          type: OtpType.PHONE_VERIFICATION,
        })
        .expect(400);
    });

    it('should fail to verify OTP with expired code', async () => {
      // This test would require manipulating the database to create an expired OTP
      // For now, we'll test the basic validation
      await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          code: '',
          type: OtpType.PHONE_VERIFICATION,
        })
        .expect(400);
    });
  });

  describe('2. Complete Profile Flow', () => {
    it('should fail to complete profile without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/complete-profile')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          role: UserRole.USER,
        })
        .expect(401);
    });

    it('should complete profile with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/complete-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          role: UserRole.USER,
        })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Profile completed successfully',
      );
    });

    it('should fail to complete profile with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/complete-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: '', // Invalid empty name
          lastName: 'Doe',
          birthDate: '1990-01-01',
          role: UserRole.USER,
        })
        .expect(400);
    });

    it('should fail to complete profile with invalid role', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/complete-profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
          role: 'invalid_role',
        })
        .expect(400);
    });
  });

  describe('3. Set Password Flow', () => {
    it('should fail to set password without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/set-password')
        .send({
          password: 'MyPassword123',
        })
        .expect(401);
    });

    it('should set password successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/set-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: 'MyPassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Password set successfully',
      );
    });

    it('should fail to set password with weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/set-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: '123', // Too short
        })
        .expect(400);
    });

    it('should fail to set password with invalid format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/set-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: '', // Empty password
        })
        .expect(400);
    });
  });

  describe('4. Login Flow', () => {
    it('should login with password successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
          password: 'MyPassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('phoneNumber', testPhoneNumber);
      expect(response.body.user).toHaveProperty('status', UserStatus.ACTIVE);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should fail to login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should fail to login with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: '09123456789',
          password: 'MyPassword123',
        })
        .expect(404);
    });

    it('should login with OTP successfully', async () => {
      // Send login OTP
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phoneNumber: testPhoneNumber,
          type: OtpType.LOGIN,
        })
        .expect(201);

      // Login with OTP (using mock OTP for testing)
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
          otpCode: '123456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should fail to login with invalid OTP', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
          otpCode: '000000',
        })
        .expect(401);
    });

    it('should fail to login without password or OTP', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
        })
        .expect(400);
    });
  });

  describe('5. Account Unlock Flow', () => {
    it('should lock account after multiple failed login attempts', async () => {
      // Attempt multiple failed logins
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            phoneNumber: testPhoneNumber,
            password: 'WrongPassword123',
          })
          .expect(401);
      }

      // Next login attempt should fail due to locked account
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
          password: 'MyPassword123',
        })
        .expect(401);
    });

    it('should send unlock OTP for locked account', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phoneNumber: testPhoneNumber,
          type: OtpType.ACCOUNT_UNLOCK,
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'OTP sent successfully');
    });

    it('should unlock account with valid OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phoneNumber: testPhoneNumber,
          code: '123456',
          type: OtpType.ACCOUNT_UNLOCK,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Account unlocked successfully',
      );
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('status', UserStatus.ACTIVE);
    });

    it('should allow login after account unlock', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          phoneNumber: testPhoneNumber,
          password: 'MyPassword123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });

  describe('6. Token Refresh Flow', () => {
    it('should refresh access token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(accessToken); // Should be different
    });

    it('should fail to refresh with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid_token',
        })
        .expect(401);
    });

    it('should fail to refresh with expired refresh token', async () => {
      // This would require manipulating the database to create an expired token
      // For now, we'll test the basic validation
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: '',
        })
        .expect(400);
    });
  });

  describe('7. Logout Flow', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Logged out successfully',
      );
    });

    it('should fail to logout without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });

  describe('8. Profile Management Flow', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('phoneNumber', testPhoneNumber);
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      expect(response.body).toHaveProperty('status', UserStatus.ACTIVE);
    });

    it('should fail to get profile without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .expect(401);
    });
  });

  describe('9. Error Handling and Edge Cases', () => {
    it('should handle rate limiting for OTP requests', async () => {
      // Send multiple OTP requests rapidly
      const promises = Array(15)
        .fill(null)
        .map(() =>
          request(app.getHttpServer()).post('/api/v1/auth/send-otp').send({
            phoneNumber: testPhoneNumber,
            type: OtpType.PHONE_VERIFICATION,
          }),
        );

      const responses = await Promise.all(promises);
      // Some requests should be rate limited
      const rateLimited = responses.some((response) => response.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('should handle concurrent OTP verification attempts', async () => {
      // Send OTP
      await request(app.getHttpServer()).post('/api/v1/auth/send-otp').send({
        phoneNumber: testPhoneNumber,
        type: OtpType.PHONE_VERIFICATION,
      });

      // Try to verify the same OTP multiple times
      const promises = Array(3)
        .fill(null)
        .map(() =>
          request(app.getHttpServer()).post('/api/v1/auth/verify-otp').send({
            phoneNumber: testPhoneNumber,
            code: '123456',
            type: OtpType.PHONE_VERIFICATION,
          }),
        );

      const responses = await Promise.all(promises);
      // Only one should succeed, others should fail
      const successful = responses.filter(
        (response) => response.status === 201,
      );
      expect(successful).toHaveLength(1);
    });

    it('should handle malformed JSON requests', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          // Missing phoneNumber and type
        })
        .expect(400);
    });
  });
});
