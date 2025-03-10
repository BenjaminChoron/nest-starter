import { User } from '../../src/contexts/auth/domain/entities/user.entity';
import { Email } from '../../src/contexts/auth/domain/value-objects/email.value-object';
import { Password } from '../../src/contexts/auth/domain/value-objects/password.value-object';

export interface UserFactoryDefaults {
  id: string;
  email: string;
  password: string;
  roles: string[];
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
}

export class UserFactory {
  private static defaults: UserFactoryDefaults = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'StrongP@ss123',
    roles: ['user'],
    isEmailVerified: false,
    verificationToken: 'test-verification-token',
    verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  };

  static async create(overrides: Partial<UserFactoryDefaults> = {}): Promise<User> {
    const data = { ...this.defaults, ...overrides } as UserFactoryDefaults;
    const hashedPassword = await Password.create(data.password);

    return new User(
      data.id,
      new Email(data.email),
      hashedPassword,
      data.roles,
      data.isEmailVerified,
      data.verificationToken,
      data.verificationTokenExpiresAt,
    );
  }

  static async createVerified(overrides: Partial<UserFactoryDefaults> = {}): Promise<User> {
    return this.create({
      isEmailVerified: true,
      verificationToken: undefined,
      verificationTokenExpiresAt: undefined,
      ...overrides,
    });
  }

  static async createMany(count: number, overrides: Partial<UserFactoryDefaults> = {}): Promise<User[]> {
    return Promise.all(
      Array(count)
        .fill(null)
        .map((_, index) =>
          this.create({
            ...overrides,
            id: `${this.defaults.id}-${index + 1}`,
            email: `test-${index + 1}@example.com`,
          }),
        ),
    );
  }
}
