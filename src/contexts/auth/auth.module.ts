import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './interfaces/http/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalAuthGuard } from './interfaces/http/guards/local-auth.guard';
import { JwtAuthGuard } from './interfaces/http/guards/jwt-auth.guard';
import { RegisterUserHandler } from './application/handlers/register-user.handler';
import { LoginUserHandler } from './application/handlers/login-user.handler';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

const commandHandlers = [RegisterUserHandler, LoginUserHandler];
const strategies = [LocalStrategy, JwtStrategy];
const guards = [LocalAuthGuard, JwtAuthGuard];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: await configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...strategies,
    ...guards,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
