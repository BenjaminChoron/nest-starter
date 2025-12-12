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

  // Get ConfigService
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const corsCredentials = configService.get<string>('CORS_CREDENTIALS', 'true') === 'true';
  const corsMethods = configService.get<string>('CORS_METHODS', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');

  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(',').map((origin: string) => origin.trim()),
      credentials: corsCredentials,
      methods: corsMethods.split(',').map((method: string) => method.trim()),
    });
  } else {
    app.enableCors();
  }

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Global exception filter
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter, configService));

  const port = configService.get<number>('PORT', 3000);
  const swaggerServerUrl = configService.get<string>('SWAGGER_SERVER_URL', `http://localhost:${port}`);
  const swaggerContactName = configService.get<string>('SWAGGER_CONTACT_NAME', 'Your Name');
  const swaggerContactUrl = configService.get<string>('SWAGGER_CONTACT_URL', 'https://yourwebsite.com');
  const swaggerContactEmail = configService.get<string>('SWAGGER_CONTACT_EMAIL', 'contact@yourwebsite.com');

  const config = new DocumentBuilder()
    .setTitle('NestJS Starter API')
    .setDescription(
      `
A modern REST API built with NestJS, implementing Domain-Driven Design (DDD) and CQRS patterns.

## Features
- Authentication with JWT and refresh tokens
- Email verification
- User management with role-based access control
- SuperAdmin role system (first user is automatically SuperAdmin)
- User invitation system (SuperAdmin can invite users)
- Profile completion flow
- Role management (SuperAdmin can update user roles)
- PostgreSQL database
- Swagger API documentation

## Roles
The system supports three roles:
- **superAdmin**: The first user created automatically receives this role. Only superAdmin can invite users and change user roles.
- **admin**: Can access admin-only endpoints
- **user**: Standard user role

## CSRF Protection
This API uses CSRF protection mechanisms. To get a CSRF token, make a GET request to /csrf

## Authentication
Most endpoints require Bearer token authentication. To get a token:
1. Register a new user (/auth/register) - First user becomes superAdmin
2. Verify email (/auth/verify?token=...)
3. Login with credentials (/auth/login)
4. Use the returned token in the Authorization header

## User Invitation Flow (SuperAdmin Only)
1. SuperAdmin invites a user via POST /auth/invite-user (provides email and role)
2. User receives email with profile creation link
3. User completes profile via POST /auth/complete-profile?token=...
4. User can now login with their credentials
    `,
    )
    .setVersion('1.0')
    .setContact(swaggerContactName, swaggerContactUrl, swaggerContactEmail)
    .addServer(swaggerServerUrl, 'Local Development')
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

  await app.listen(port);
}

void bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
