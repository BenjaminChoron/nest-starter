import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './contexts/auth/auth.module';
import { UserModule } from './contexts/user/user.module';
import { SharedModule } from './contexts/shared/shared.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import {
  CsrfProtectionMiddleware,
  CsrfTokenMiddleware,
} from './contexts/shared/infrastructure/middleware/csrf.middleware';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: configService.get('THROTTLE_SHORT_TTL', 1000),
          limit: configService.get('THROTTLE_SHORT_LIMIT', 3),
        },
        {
          name: 'medium',
          ttl: configService.get('THROTTLE_MEDIUM_TTL', 60000),
          limit: configService.get('THROTTLE_MEDIUM_LIMIT', 10),
        },
        {
          name: 'long',
          ttl: configService.get('THROTTLE_LONG_TTL', 3600000),
          limit: configService.get('THROTTLE_LONG_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT', 587),
          secure: configService.get('SMTP_SECURE', 'false') === 'true',
          ignoreTLS: configService.get('SMTP_IGNORE_TLS', 'false') === 'true',
          requireTLS: configService.get('SMTP_REQUIRE_TLS', 'true') === 'true',
          pool: true,
          maxConnections: configService.get('SMTP_MAX_CONNECTIONS', 5),
          maxMessages: configService.get('SMTP_MAX_MESSAGES', 100),
          rateDelta: configService.get('SMTP_RATE_DELTA', 1000),
          rateLimit: configService.get('SMTP_RATE_LIMIT', 10),
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: configService.get('NODE_ENV', 'development') === 'production',
          },
        },
        defaults: {
          from: configService.get('SMTP_FROM'),
        },
        template: {
          dir: path.join(process.cwd(), 'templates'),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
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
