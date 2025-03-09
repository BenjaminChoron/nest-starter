import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // Override this method if you need custom throttling logic
  protected async getTracker(req: Request): Promise<string> {
    // Use IP address as the tracker by default
    return Promise.resolve(req.ip || req.socket.remoteAddress || 'unknown');
  }
}
