/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../../application/commands/login-user.command';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<{ access_token: string }> {
    try {
      const result = await this.commandBus.execute<LoginUserCommand, { access_token: string }>(
        new LoginUserCommand(email, password),
      );
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
