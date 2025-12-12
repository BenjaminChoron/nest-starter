import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from '../commands/login-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InvalidCredentialsException } from '../../../shared/application/exceptions/invalid-credentials.exception';
import { Email } from '../../domain/value-objects/email.value-object';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../../interfaces/http/dtos/auth.dto';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LoginUserCommand): Promise<{ access_token: string; refresh_token: string; user: UserDto }> {
    const { email, password } = command;
    const emailVO = new Email(email);

    const user = await this.userRepository.findByEmail(emailVO);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    };

    // Generate access token
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_TTL'),
    });

    // Generate refresh token
    const refreshPayload = {
      sub: user.id,
      refreshToken: this.generateRefreshTokenId(),
    };

    const refresh_token = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_TOKEN_TTL'),
    });

    // Save refresh token to user
    const refreshTokenExpiresAt = new Date();
    // Parse JWT_REFRESH_TOKEN_TTL to get days (e.g., "7d" -> 7, "14d" -> 14)
    const refreshTokenTtl = this.configService.get<string>('JWT_REFRESH_TOKEN_TTL', '7d');
    const ttlDays = parseInt(refreshTokenTtl.replace(/[^0-9]/g, ''), 10) || 7;
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + ttlDays);
    user.setRefreshToken(refreshPayload.refreshToken, refreshTokenExpiresAt);
    await this.userRepository.save(user);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  private generateRefreshTokenId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
