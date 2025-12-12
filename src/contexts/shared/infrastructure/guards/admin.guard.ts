import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../../auth/interfaces/http/dtos/auth.dto';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    const user = request.user;

    if (!user || (!user.roles.includes('admin') && !user.roles.includes('superAdmin'))) {
      throw new UnauthorizedException('Admin access required');
    }

    return true;
  }
}
