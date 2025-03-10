import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ValidateRefreshTokenCommand } from '../commands/validate-refresh-token.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@CommandHandler(ValidateRefreshTokenCommand)
export class ValidateRefreshTokenHandler implements ICommandHandler<ValidateRefreshTokenCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: ValidateRefreshTokenCommand) {
    const { userId, refreshToken } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isRefreshTokenValid() || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
    };

    // Generate new access token
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
