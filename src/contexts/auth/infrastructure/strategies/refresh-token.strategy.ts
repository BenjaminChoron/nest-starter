/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateRefreshTokenCommand } from '../../application/commands/validate-refresh-token.command';
import { UserDto } from '../../interfaces/http/dtos/auth.dto';

interface RefreshTokenPayload {
  sub: string;
  refreshToken: string;
  exp: number;
  iat: number;
}

interface ValidateRefreshTokenResult {
  access_token: string;
  user: UserDto;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: RefreshTokenPayload): Promise<ValidateRefreshTokenResult> {
    return this.commandBus.execute(new ValidateRefreshTokenCommand(payload.sub, payload.refreshToken));
  }
}
