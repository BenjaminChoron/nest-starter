import { SuperAdminGuard } from './super-admin.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../../auth/interfaces/http/dtos/auth.dto';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;

  beforeEach(() => {
    guard = new SuperAdminGuard();
  });

  it('should allow access for users with superAdmin role', () => {
    const mockRequest = {
      user: {
        sub: '123',
        email: 'test@example.com',
        roles: ['superAdmin'],
        isEmailVerified: true,
      } as JwtPayload,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access for users without superAdmin role', () => {
    const mockRequest = {
      user: {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        isEmailVerified: true,
      } as JwtPayload,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('SuperAdmin access required');
  });

  it('should deny access for users with admin role but not superAdmin', () => {
    const mockRequest = {
      user: {
        sub: '123',
        email: 'test@example.com',
        roles: ['admin'],
        isEmailVerified: true,
      } as JwtPayload,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('SuperAdmin access required');
  });

  it('should deny access when user is not present', () => {
    const mockRequest = {};

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('SuperAdmin access required');
  });

  it('should deny access when roles array is empty', () => {
    const mockRequest = {
      user: {
        sub: '123',
        email: 'test@example.com',
        roles: [],
        isEmailVerified: true,
      } as JwtPayload,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('SuperAdmin access required');
  });
});
