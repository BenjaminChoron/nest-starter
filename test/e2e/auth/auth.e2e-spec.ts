import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper } from '../../test.helper';
import { DataSource, Repository } from 'typeorm';
import { UserEntity as AuthUserEntity } from '../../../src/contexts/auth/infrastructure/persistence/typeorm/user.entity';
import { UserEntity as UserProfileEntity } from '../../../src/contexts/user/infrastructure/persistence/typeorm/user.entity';
import { Server } from 'http';
import { LoginResponseDto, UserDto } from '../../../src/contexts/auth/interfaces/http/dtos/auth.dto';

interface RegisterResponse {
  message: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    isEmailVerified: boolean;
  };
}

interface UserProfileResponse extends UserDto {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
}

interface MessageResponse {
  message: string;
}

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let httpServer: Server;
  let authUserRepository: Repository<AuthUserEntity>;
  let userProfileRepository: Repository<UserProfileEntity>;

  beforeAll(async () => {
    app = await TestHelper.getApp();
    dataSource = app.get(DataSource);
    httpServer = app.getHttpServer() as Server;
    authUserRepository = dataSource.getRepository(AuthUserEntity);
    userProfileRepository = dataSource.getRepository(UserProfileEntity);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
    await new Promise<void>((resolve) => {
      if (httpServer?.listening) {
        httpServer.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  beforeEach(async () => {
    await TestHelper.clearDatabase();
  });

  describe('Authentication Flow', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user, verify email, and login successfully', async () => {
      // Register user
      const registerResponse = await request(httpServer).post('/auth/register').send(testUser).expect(201);

      const registerBody = registerResponse.body as RegisterResponse;
      expect(registerBody).toHaveProperty('message');
      expect(registerBody.message).toBe(
        'User registered successfully. Please check your email for verification instructions.',
      );

      // Get verification token from database
      const authUser = await authUserRepository.findOne({ where: { email: testUser.email } });
      if (!authUser || !authUser.verificationToken) {
        throw new Error('Auth user not found or verification token missing');
      }

      // Create user profile
      const userProfile = new UserProfileEntity();
      userProfile.id = authUser.id;
      userProfile.email = testUser.email;
      userProfile.firstName = testUser.firstName;
      userProfile.lastName = testUser.lastName;
      await userProfileRepository.save(userProfile);

      // Verify email
      await request(httpServer).get(`/auth/verify?token=${authUser.verificationToken}`).expect(200);

      // Login
      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponseDto;
      expect(loginBody).toHaveProperty('access_token');
      expect(loginBody).toHaveProperty('refresh_token');
      expect(loginBody).toHaveProperty('user');
      expect(loginBody.user.email).toBe(testUser.email);

      // Test protected route access
      const protectedResponse = await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginBody.access_token}`)
        .expect(200);

      const profileBody = protectedResponse.body as UserProfileResponse;
      expect(profileBody.email).toBe(testUser.email);
      expect(profileBody.firstName).toBe(testUser.firstName);
      expect(profileBody.lastName).toBe(testUser.lastName);
    });

    it('should not allow login with unverified email', async () => {
      // Register user
      await request(httpServer).post('/auth/register').send(testUser).expect(201);

      // Attempt to login without verifying email
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);
    });

    it('should not allow login with incorrect password', async () => {
      // Register and verify user first
      await request(httpServer).post('/auth/register').send(testUser).expect(201);

      // Attempt login with wrong password
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should handle concurrent registration attempts with same email', async () => {
      // First registration should succeed
      await request(httpServer).post('/auth/register').send(testUser).expect(201);

      // Second registration with same email should fail
      await request(httpServer).post('/auth/register').send(testUser).expect(409); // Conflict
    });

    it('should refresh access token successfully', async () => {
      // Register and verify user
      await request(httpServer).post('/auth/register').send(testUser).expect(201);
      const user = await authUserRepository.findOne({ where: { email: testUser.email } });
      await request(httpServer).get(`/auth/verify?token=${user?.verificationToken}`).expect(200);

      // Login to get tokens
      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;
      expect(loginBody.refresh_token).toBeDefined();

      // Use refresh token to get new access token
      const refreshResponse = await request(httpServer)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${loginBody.refresh_token}`)
        .expect(200);

      const refreshBody = refreshResponse.body as LoginResponse;
      expect(refreshBody.access_token).toBeDefined();
      expect(refreshBody.user).toBeDefined();
      expect(refreshBody.user.email).toBe(testUser.email);

      // Verify new access token works
      await request(httpServer).get('/auth/me').set('Authorization', `Bearer ${refreshBody.access_token}`).expect(200);
    });

    it('should logout successfully and invalidate refresh token', async () => {
      // Register and verify user
      await request(httpServer).post('/auth/register').send(testUser).expect(201);
      const user = await authUserRepository.findOne({ where: { email: testUser.email } });
      await request(httpServer).get(`/auth/verify?token=${user?.verificationToken}`).expect(200);

      // Login to get tokens
      const loginResponse = await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;

      // Logout
      await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${loginBody.access_token}`)
        .expect(200);

      // Attempt to use refresh token after logout (should fail)
      await request(httpServer)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${loginBody.refresh_token}`)
        .expect(401);
    });

    it('should not allow access to protected routes with expired token', async () => {
      // Register and verify user
      await request(httpServer).post('/auth/register').send(testUser).expect(201);
      const user = await authUserRepository.findOne({ where: { email: testUser.email } });
      await request(httpServer).get(`/auth/verify?token=${user?.verificationToken}`).expect(200);

      // Use an invalid/expired token
      const invalidToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      await request(httpServer).get('/auth/me').set('Authorization', `Bearer ${invalidToken}`).expect(401);
    });

    describe('Password Reset Flow', () => {
      it('should handle the complete password reset flow successfully', async () => {
        // Register and verify user first
        await request(httpServer).post('/auth/register').send(testUser).expect(201);
        const user = await authUserRepository.findOne({ where: { email: testUser.email } });
        await request(httpServer).get(`/auth/verify?token=${user?.verificationToken}`).expect(200);

        // Request password reset
        const requestResetResponse = await request(httpServer)
          .post('/auth/password-reset/request')
          .send({ email: testUser.email })
          .expect(200);

        const resetRequestBody = requestResetResponse.body as MessageResponse;
        expect(resetRequestBody.message).toBe('Password reset instructions have been sent to your email');

        // Get the reset token from the database
        const updatedUser = await authUserRepository.findOne({
          where: { email: testUser.email },
          select: ['id', 'email', 'passwordResetToken'],
        });
        expect(updatedUser?.passwordResetToken).toBeDefined();

        // Reset the password
        const newPassword = 'NewTest123!';
        const resetResponse = await request(httpServer)
          .post(`/auth/password-reset?token=${updatedUser?.passwordResetToken}`)
          .send({ password: newPassword })
          .expect(200);

        const resetResponseBody = resetResponse.body as MessageResponse;
        expect(resetResponseBody.message).toBe('Password has been reset successfully');

        // Try logging in with the new password
        const loginResponse = await request(httpServer)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: newPassword,
          })
          .expect(200);

        expect(loginResponse.body).toHaveProperty('access_token');
      });

      it('should not allow password reset with invalid token', async () => {
        const invalidToken = 'invalid-token';
        await request(httpServer)
          .post(`/auth/password-reset?token=${invalidToken}`)
          .send({ password: 'NewTest123!' })
          .expect(400);
      });

      it('should not allow password reset request for non-existent email', async () => {
        await request(httpServer)
          .post('/auth/password-reset/request')
          .send({ email: 'nonexistent@example.com' })
          .expect(404);
      });

      it('should not allow password reset with expired token', async () => {
        // Register user
        await request(httpServer).post('/auth/register').send(testUser).expect(201);

        // Request password reset
        await request(httpServer).post('/auth/password-reset/request').send({ email: testUser.email }).expect(200);

        // Try with an expired token
        const expiredToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        await request(httpServer)
          .post(`/auth/password-reset?token=${expiredToken}`)
          .send({ password: 'NewTest123!' })
          .expect(400);
      });
    });
  });

  describe('Role-Based Access Control', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
      // Clear database before each test
      await TestHelper.clearDatabase();

      // Register and verify admin user
      const adminRegisterResponse = await request(httpServer).post('/auth/register').send({
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
      });
      expect(adminRegisterResponse.status).toBe(201);

      // Get admin verification token and verify email
      const adminUser = await authUserRepository.findOne({ where: { email: 'admin@example.com' } });
      if (!adminUser || !adminUser.verificationToken) {
        throw new Error('Admin user not found or verification token missing');
      }

      // Verify email and set admin role
      await request(httpServer).get(`/auth/verify?token=${adminUser.verificationToken}`).expect(200);
      await authUserRepository.update(adminUser.id, { roles: ['admin'] });

      // Login as admin
      const adminLoginResponse = await request(httpServer).post('/auth/login').send({
        email: 'admin@example.com',
        password: 'Admin123!',
      });
      const adminLoginBody = adminLoginResponse.body as LoginResponseDto;
      adminToken = adminLoginBody.access_token;

      // Register and verify regular user
      const userRegisterResponse = await request(httpServer).post('/auth/register').send({
        email: 'user@example.com',
        password: 'User123!',
        firstName: 'Regular',
        lastName: 'User',
      });
      expect(userRegisterResponse.status).toBe(201);

      // Get user verification token and verify email
      const regularUser = await authUserRepository.findOne({ where: { email: 'user@example.com' } });
      if (!regularUser || !regularUser.verificationToken) {
        throw new Error('Regular user not found or verification token missing');
      }

      // Verify email
      await request(httpServer).get(`/auth/verify?token=${regularUser.verificationToken}`).expect(200);

      // Login as regular user
      const userLoginResponse = await request(httpServer).post('/auth/login').send({
        email: 'user@example.com',
        password: 'User123!',
      });
      const userLoginBody = userLoginResponse.body as LoginResponseDto;
      userToken = userLoginBody.access_token;
    });

    describe('Admin-only endpoints', () => {
      it('should allow admin to access admin-only endpoint', async () => {
        const response = await request(httpServer)
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should deny regular user access to admin-only endpoint', async () => {
        await request(httpServer).get('/users').set('Authorization', `Bearer ${userToken}`).expect(401);
      });

      it('should deny access to admin-only endpoint without token', async () => {
        await request(httpServer).get('/users').expect(401);
      });

      it('should deny access with invalid token', async () => {
        await request(httpServer).get('/users').set('Authorization', 'Bearer invalid-token').expect(401);
      });
    });

    describe('User role verification', () => {
      it('should include correct roles in user profile', async () => {
        // Check admin profile
        const adminProfileResponse = await request(httpServer)
          .get('/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        const adminProfile = adminProfileResponse.body as UserProfileResponse;

        expect(adminProfile.roles).toContain('admin');

        // Check regular user profile
        const userProfileResponse = await request(httpServer)
          .get('/auth/me')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);
        const userProfile = userProfileResponse.body as UserProfileResponse;

        expect(userProfile.roles).toContain('user');
        expect(userProfile.roles).not.toContain('admin');
      });
    });
  });
});
