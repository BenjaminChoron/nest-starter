import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'postgres',
  database: 'nest_db_test',
  entities: ['src/**/*.entity.ts'],
  synchronize: true, // Only for testing
});

export const TEST_JWT_SECRET = 'test-secret';
export const TEST_JWT_EXPIRATION = '1h';
