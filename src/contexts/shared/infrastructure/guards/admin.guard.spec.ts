import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { JwtPayload } from '../../../auth/interfaces/http/dtos/auth.dto';
import { Request } from 'express';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access for users with admin role', () => {
      const mockRequest = {
        user: {
          sub: '123',
          email: 'admin@example.com',
          roles: ['admin'],
          isEmailVerified: true,
        } as JwtPayload,
      } as Request & { user: JwtPayload };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access for users with superAdmin role', () => {
      const mockRequest = {
        user: {
          sub: '123',
          email: 'superadmin@example.com',
          roles: ['superAdmin'],
          isEmailVerified: true,
        } as JwtPayload,
      } as Request & { user: JwtPayload };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access for users with both admin and superAdmin roles', () => {
      const mockRequest = {
        user: {
          sub: '123',
          email: 'admin@example.com',
          roles: ['admin', 'superAdmin'],
          isEmailVerified: true,
        } as JwtPayload,
      } as Request & { user: JwtPayload };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should deny access for users without admin role', () => {
      const mockRequest = {
        user: {
          sub: '123',
          email: 'user@example.com',
          roles: ['user'],
          isEmailVerified: true,
        } as JwtPayload,
      } as Request & { user: JwtPayload };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should deny access for users with multiple non-admin roles', () => {
      const mockRequest = {
        user: {
          sub: '123',
          email: 'user@example.com',
          roles: ['user', 'moderator'],
          isEmailVerified: true,
        } as JwtPayload,
      } as Request & { user: JwtPayload };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should deny access when user object is missing', () => {
      const mockRequest = {} as Request;

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should deny access when roles array is empty', () => {
      const mockRequest = {
        user: {
          sub: '123',
          email: 'user@example.com',
          roles: [],
          isEmailVerified: true,
        } as JwtPayload,
      } as Request & { user: JwtPayload };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });
  });
});
