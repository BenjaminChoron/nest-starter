import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  ...getDatabaseConfig(configService),
});
