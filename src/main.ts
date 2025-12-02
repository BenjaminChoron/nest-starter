import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GlobalExceptionFilter } from './contexts/shared/infrastructure/exceptions/global-exception.filter';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Global exception filter
  const httpAdapter = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter, configService));

  const config = new DocumentBuilder()
    .setTitle('NestJS Starter API')
    .setDescription(
      `
A modern REST API built with NestJS, implementing Domain-Driven Design (DDD) and CQRS patterns.

## Features
- Authentication with JWT
- Email verification
- User management
- Role-based access control
- PostgreSQL database
- Swagger API documentation

## CSRF Protection
This API uses CSRF protection mechanisms. To get a CSRF token, make a GET request to /csrf

## Authentication
Most endpoints require Bearer token authentication. To get a token:
1. Login with credentials (/auth/login)
2. Use the returned token in the Authorization header
    `,
    )
    .setVersion('1.0')
    .setContact('Benjamin Choron', 'https://benjamin-choron.com', 'contact@benjamin-choron.com')
    .addServer('http://localhost:3000', 'Local Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
