import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './interfaces/http/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RefreshTokenStrategy } from './infrastructure/strategies/refresh-token.strategy';
import { LocalAuthGuard } from './interfaces/http/guards/local-auth.guard';
import { JwtAuthGuard } from './interfaces/http/guards/jwt-auth.guard';
import { RefreshTokenGuard } from './interfaces/http/guards/refresh-token.guard';
import { RegisterUserHandler } from './application/handlers/register-user.handler';
import { LoginUserHandler } from './application/handlers/login-user.handler';
import { LogoutUserHandler } from './application/handlers/logout-user.handler';
import { ValidateRefreshTokenHandler } from './application/handlers/validate-refresh-token.handler';
import { VerifyEmailHandler } from './application/handlers/verify-email.handler';
import { EmailVerificationSaga } from './application/sagas/email-verification.saga';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/typeorm-user.repository';
import { UserEntity } from './infrastructure/persistence/typeorm/user.entity';
import { SharedModule } from '../shared/shared.module';
import { RequestPasswordResetHandler } from './application/handlers/request-password-reset.handler';
import { ResetPasswordHandler } from './application/handlers/reset-password.handler';

const commandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  LogoutUserHandler,
  ValidateRefreshTokenHandler,
  VerifyEmailHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
];
const strategies = [LocalStrategy, JwtStrategy, RefreshTokenStrategy];
const guards = [LocalAuthGuard, JwtAuthGuard, RefreshTokenGuard];
const sagas = [EmailVerificationSaga];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    SharedModule,
    TypeOrmModule.forFeature([UserEntity]),
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
    ...sagas,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
