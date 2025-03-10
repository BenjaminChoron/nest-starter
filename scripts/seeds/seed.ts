import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { UserEntity as UserProfileEntity } from '../../src/contexts/user/infrastructure/persistence/typeorm/user.entity';
import { UserEntity as AuthUserEntity } from '../../src/contexts/auth/infrastructure/persistence/typeorm/user.entity';
import { getDatabaseConfig } from '../../src/config/database.config';
import { log } from '../utils/log';
import { Password } from '../../src/contexts/auth/domain/value-objects/password.value-object';

type UserProfileSeed = Omit<UserProfileEntity, 'toDomain' | 'fromDomain'>;
type AuthUserSeed = Omit<AuthUserEntity, 'toDomain' | 'fromDomain'>;

interface UserSeedData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  roles?: string[];
  isEmailVerified?: boolean;
}

const SEED_USERS: UserSeedData[] = [
  {
    id: v4(),
    email: 'john.doe@example.com',
    password: 'StrongP@ss123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: 'https://example.com/profiles/john.jpg',
    phone: '+1234567890',
    address: '123 Main St, City, Country',
    roles: ['user', 'admin'],
    isEmailVerified: true,
  },
  {
    id: v4(),
    email: 'jane.smith@example.com',
    password: 'SecureP@ss456',
    firstName: 'Jane',
    lastName: 'Smith',
    profilePicture: 'https://example.com/profiles/jane.jpg',
    phone: '+1987654321',
    address: '456 Oak Ave, Town, Country',
    roles: ['user'],
    isEmailVerified: true,
  },
  {
    id: v4(),
    email: 'alice.johnson@example.com',
    password: 'P@ssw0rd789',
    firstName: 'Alice',
    lastName: 'Johnson',
    profilePicture: 'https://example.com/profiles/alice.jpg',
    phone: '+1122334455',
    address: '789 Pine Rd, Village, Country',
    roles: ['user'],
    isEmailVerified: false,
  },
];

async function seed(): Promise<void> {
  console.log('\n🌱 DATABASE SEEDING SCRIPT\n');
  const startTime = Date.now();

  const configService = new ConfigService();
  const dataSource = new DataSource(getDatabaseConfig(configService));

  try {
    // Initialize the data source
    log.step(1, 5, 'Connecting to database');
    await dataSource.initialize();
    log.success('Connected to database successfully');

    // Clear existing data
    log.step(2, 5, 'Clearing existing data');
    await dataSource.getRepository(AuthUserEntity).clear();
    await dataSource.getRepository(UserProfileEntity).clear();
    log.success('Existing data cleared successfully');

    // Create auth users
    log.step(3, 5, 'Creating auth users');
    const authUsers: AuthUserSeed[] = await Promise.all(
      SEED_USERS.map(async (userData) => {
        const hashedPassword = await Password.create(userData.password);
        return {
          id: userData.id,
          email: userData.email,
          password: hashedPassword.toString(),
          roles: userData.roles || ['user'],
          isEmailVerified: userData.isEmailVerified ?? false,
          verificationToken: userData.isEmailVerified ? null : v4(),
          verificationTokenExpiresAt: userData.isEmailVerified ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
          refreshToken: userData.isEmailVerified ? null : v4(),
          refreshTokenExpiresAt: userData.isEmailVerified ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      }),
    );
    await dataSource.getRepository(AuthUserEntity).save(authUsers);
    log.success(`Created ${authUsers.length} auth users successfully`);

    // Create user profiles
    log.step(4, 5, 'Creating user profiles');
    const userProfiles: UserProfileSeed[] = SEED_USERS.map((userData) => ({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePicture: userData.profilePicture,
      phone: userData.phone,
      address: userData.address,
    }));
    await dataSource.getRepository(UserProfileEntity).save(userProfiles);
    log.success(`Created ${userProfiles.length} user profiles successfully`);

    // Cleanup
    log.step(5, 5, 'Cleaning up');
    await dataSource.destroy();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log.divider();
    log.success(`Database seeding completed successfully in ${duration}s`);
    process.exit(0);
  } catch (error: unknown) {
    log.divider();
    log.error('Database seeding failed');
    if (error instanceof Error) {
      log.error('Reason:', error.message);
      if (error.stack) {
        console.log('\nStack trace:');
        console.log(error.stack);
      }
    } else {
      log.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the seed function
void seed();
