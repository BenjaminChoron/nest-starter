import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
  stack?: string;
}

interface HttpExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Generate a correlation ID for tracking the error
    const correlationId = this.generateCorrelationId();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as HttpExceptionResponse;
      statusCode = exception.getStatus();
      message = exceptionResponse.message || exception.message;
      error = exceptionResponse.error || exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request) as string,
      correlationId,
    };

    // Add stack trace in development environment
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    if (isDevelopment && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    // Log the error
    this.logError(errorResponse, exception);

    httpAdapter.reply(response, errorResponse, statusCode);
  }

  private generateCorrelationId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(errorResponse: ErrorResponse, exception: unknown): void {
    const logMessage = {
      correlationId: errorResponse.correlationId,
      timestamp: errorResponse.timestamp,
      path: errorResponse.path,
      statusCode: errorResponse.statusCode,
      message: errorResponse.message,
      error: errorResponse.error,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `Internal Server Error: ${JSON.stringify(logMessage)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`Application Error: ${JSON.stringify(logMessage)}`);
    }
  }
}
