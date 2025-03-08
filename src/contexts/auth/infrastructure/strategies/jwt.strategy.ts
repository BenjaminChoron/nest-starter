/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: { sub: string; email: string; roles: string[] }): { id: string; email: string; roles: string[] } {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
