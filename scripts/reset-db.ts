import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

const configService = new ConfigService();

const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_NAME', 'nest_db'),
  entities: [join(__dirname, '..', 'dist/**/*.entity.js')],
  synchronize: false,
});

async function resetDatabase(): Promise<void> {
  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Connected to database');

    // Drop all tables
    await dataSource.dropDatabase();
    console.log('Dropped all tables');

    // Synchronize database schema
    await dataSource.synchronize(true);
    console.log('Re-created database schema');

    // Close the connection
    await dataSource.destroy();
    console.log('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

void resetDatabase();
