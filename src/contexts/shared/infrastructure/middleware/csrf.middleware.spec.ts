import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { CsrfProtectionMiddleware, CsrfTokenMiddleware } from './csrf.middleware';

describe('CSRF Middleware', () => {
  let protectionMiddleware: CsrfProtectionMiddleware;
  let tokenMiddleware: CsrfTokenMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsrfProtectionMiddleware, CsrfTokenMiddleware],
    }).compile();

    protectionMiddleware = module.get<CsrfProtectionMiddleware>(CsrfProtectionMiddleware);
    tokenMiddleware = module.get<CsrfTokenMiddleware>(CsrfTokenMiddleware);
  });

  describe('CsrfProtectionMiddleware', () => {
    let mockRequest: Partial<Request> & {
      headers: Record<string, string>;
      cookies: Record<string, string>;
      method: string;
    };
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        method: 'POST',
        headers: {},
        cookies: {},
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it('should allow safe methods without token validation', () => {
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

      safeMethods.forEach((method) => {
        mockRequest.method = method;
        protectionMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        nextFunction.mockClear();
      });
    });

    it('should validate token from header', () => {
      const mockSecret = 'test-secret';
      const mockToken = protectionMiddleware['tokens'].create(mockSecret);

      mockRequest.method = 'POST';
      mockRequest.headers['x-csrf-token'] = mockToken;
      mockRequest.cookies = { 'csrf-secret': mockSecret };

      protectionMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should validate token from cookie', () => {
      const mockSecret = 'test-secret';
      const mockToken = protectionMiddleware['tokens'].create(mockSecret);

      mockRequest.method = 'POST';
      mockRequest.cookies = {
        'csrf-token': mockToken,
        'csrf-secret': mockSecret,
      };

      protectionMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request with missing token', () => {
      mockRequest.method = 'POST';

      protectionMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token' });
    });

    it('should reject request with invalid token', () => {
      mockRequest.method = 'POST';
      mockRequest.headers['x-csrf-token'] = 'invalid-token';
      mockRequest.cookies = { 'csrf-secret': 'test-secret' };

      protectionMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token' });
    });
  });

  describe('CsrfTokenMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
      };
      mockResponse = {
        cookie: jest.fn(),
        setHeader: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it('should set CSRF tokens for GET requests', () => {
      tokenMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('x-csrf-token', expect.any(String));
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not set tokens for non-GET requests', () => {
      mockRequest.method = 'POST';

      tokenMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.cookie).not.toHaveBeenCalled();
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should set secure cookies in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      tokenMiddleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'csrf-secret',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
