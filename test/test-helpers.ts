import { UserFactory } from './factories/user.factory';

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
