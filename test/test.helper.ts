import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { getTestDatabaseConfig, TEST_JWT_SECRET, TEST_JWT_EXPIRATION } from './test.config';
import { AuthModule } from '../src/contexts/auth/auth.module';
import { UserModule } from '../src/contexts/user/user.module';
import { DataSource } from 'typeorm';
import { UserFactory } from './factories/user.factory';

export class TestHelper {
  private static app: INestApplication | undefined;
  private static moduleRef: TestingModule | undefined;

  static async getTestingModule(): Promise<TestingModule> {
    if (!this.moduleRef) {
      this.moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                jwt: {
                  secret: TEST_JWT_SECRET,
                  expiresIn: TEST_JWT_EXPIRATION,
                },
              }),
            ],
          }),
          TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: getTestDatabaseConfig,
          }),
          ThrottlerModule.forRoot([
            {
              ttl: 60,
              limit: 10,
            },
          ]),
          JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: () => ({
              secret: TEST_JWT_SECRET,
              signOptions: { expiresIn: TEST_JWT_EXPIRATION },
            }),
          }),
          AuthModule,
          UserModule,
        ],
      }).compile();
    }
    return this.moduleRef;
  }

  static async getApp(): Promise<INestApplication> {
    if (!this.app) {
      const moduleRef = await this.getTestingModule();
      this.app = moduleRef.createNestApplication();
      await this.app.init();
    }
    return this.app;
  }

  static async clearDatabase(): Promise<void> {
    const moduleRef = await this.getTestingModule();
    const dataSource = moduleRef.get(DataSource);
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
  }

  static async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.app = undefined;
    }
    if (this.moduleRef) {
      await this.moduleRef.close();
      this.moduleRef = undefined;
    }
  }
}

export const testData = {
  users: {
    validUser: {
      id: 'test-user-id',
      email: 'test@example.com',
      password: 'StrongP@ss123',
      roles: ['user'],
      isEmailVerified: false,
    },
    verifiedUser: {
      id: 'verified-user-id',
      email: 'verified@example.com',
      password: 'StrongP@ss123',
      roles: ['user'],
      isEmailVerified: true,
    },
    adminUser: {
      id: 'admin-user-id',
      email: 'admin@example.com',
      password: 'StrongP@ss123',
      roles: ['admin'],
      isEmailVerified: true,
    },
  },
  tokens: {
    validAccessToken: 'valid-access-token',
    validRefreshToken: 'valid-refresh-token',
    expiredAccessToken: 'expired-access-token',
    expiredRefreshToken: 'expired-refresh-token',
  },
  files: {
    validImage: {
      fieldname: 'file',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test-image-content'),
      size: 1024,
    },
  },
};

export const createTestUser = async (overrides = {}) => {
  return UserFactory.create(overrides);
};

export const createVerifiedTestUser = async (overrides = {}) => {
  return UserFactory.createVerified(overrides);
};

export const createTestUsers = async (count: number, overrides = {}) => {
  return UserFactory.createMany(count, overrides);
};
