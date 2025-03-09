import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../src/config/database.config';
import { log } from './utils/log';

const configService = new ConfigService();

const dataSource = new DataSource({
  ...getDatabaseConfig(configService),
  synchronize: false, // Override synchronize for safety during reset
});

async function resetDatabase(): Promise<void> {
  console.log('\n🔄 DATABASE RESET SCRIPT\n');
  const startTime = Date.now();

  try {
    // Initialize the data source
    log.step(1, 4, 'Connecting to database');
    await dataSource.initialize();
    log.success('Connected to database successfully');

    // Drop all tables
    log.step(2, 4, 'Dropping existing tables');
    await dataSource.dropDatabase();
    log.success('All tables dropped successfully');

    // Synchronize database schema
    log.step(3, 4, 'Recreating database schema');
    await dataSource.synchronize(true);
    log.success('Database schema recreated successfully');

    // Close the connection
    log.step(4, 4, 'Cleaning up');
    await dataSource.destroy();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log.divider();
    log.success(`Database reset completed successfully in ${duration}s`);
    process.exit(0);
  } catch (error) {
    log.divider();
    log.error('Database reset failed');
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

void resetDatabase();
