import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // Override this method to provide custom throttling logic
  protected getTracker(req: Request): Promise<string> {
    // Use IP address as the tracker
    return Promise.resolve(req.ip || req.socket.remoteAddress || 'unknown');
  }

  // Override to set different limits for different routes
  protected getThrottlerOptions(context: ExecutionContext) {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const route = `${classRef.name}:${handler.name}`;

    // Auth-related endpoints (login, register, password reset)
    if (route.includes('AuthController') && (route.includes('login') || route.includes('register'))) {
      return { throttler: 'short' };
    }

    // User profile updates and other sensitive operations
    if (route.includes('UserController') && (route.includes('update') || route.includes('delete'))) {
      return { throttler: 'long' };
    }

    // Default to medium throttling for all other routes
    return { throttler: 'medium' };
  }
}
