import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as csrf from 'csrf';

interface RequestWithCookies extends Request {
  cookies: {
    'csrf-token'?: string;
    'csrf-secret'?: string;
    [key: string]: string | undefined;
  };
}

interface Tokens {
  create(secret: string): string;
  secretSync(): string;
  verify(secret: string, token: string): boolean;
}

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  private readonly tokens: Tokens;

  constructor() {
    this.tokens = new csrf();
  }

  use(req: RequestWithCookies, res: Response, next: NextFunction) {
    // Skip CSRF check for non-mutating methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Get the CSRF token from the request header or cookie
    const token = (req.headers['x-csrf-token'] as string) || req.cookies['csrf-token'];
    const secret = req.cookies['csrf-secret'];

    if (!token || !secret || !this.tokens.verify(secret, token)) {
      res.status(403).json({ message: 'Invalid CSRF token' });
      return;
    }

    next();
  }
}

@Injectable()
export class CsrfTokenMiddleware implements NestMiddleware {
  private readonly tokens: Tokens;

  constructor() {
    this.tokens = new csrf();
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'GET') {
      const secret = this.tokens.secretSync();
      const token = this.tokens.create(secret);

      // Set CSRF secret in an HTTP-only cookie
      res.cookie('csrf-secret', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      // Set CSRF token in a regular cookie and response header
      res.cookie('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.setHeader('x-csrf-token', token);
    }
    next();
  }
}
