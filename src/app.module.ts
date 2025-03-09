import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './contexts/auth/auth.module';
import { UserModule } from './contexts/user/user.module';
import { SharedModule } from './contexts/shared/shared.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  CsrfProtectionMiddleware,
  CsrfTokenMiddleware,
} from './contexts/shared/infrastructure/middleware/csrf.middleware';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second for auth endpoints
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute for moderately sensitive endpoints
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 100, // 100 requests per hour for highly sensitive operations
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    SharedModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(), CsrfTokenMiddleware, CsrfProtectionMiddleware).forRoutes('*');
  }
}
