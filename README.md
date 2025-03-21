# NestJS Starter

[![NestJS](https://img.shields.io/badge/NestJS-v11.0.10-ea2845.svg)](https://nestjs.com/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![PNPM](https://img.shields.io/badge/pnpm-latest-orange.svg)](https://pnpm.io/)
[![CI](https://github.com/BenjaminChoron/nest-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/BenjaminChoron/nest-starter/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

A modern, well-structured NestJS starter template with best practices and essential tooling pre-configured.

## Features

- 🚀 Built with [NestJS](https://nestjs.com/) v11
- 📦 PNPM for fast, disk-efficient package management
- 🔒 Authentication ready with JWT and Passport strategies
- 🛡️ Comprehensive security features with CSRF protection
- 🔐 Rate limiting and brute force protection
- 🗃️ PostgreSQL database with TypeORM integration
- 📝 OpenAPI/Swagger documentation
- 🏗️ CQRS architecture with domain-driven design
- ✨ ESLint + Prettier for code quality
- 🧪 Jest for testing
- 🪝 Git hooks with Husky and lint-staged
- 📋 Conventional commits with commitlint
- 🔄 Hot reload in development
- 🐳 Docker Compose for local development
- 📧 Email integration with SendGrid
- 🔐 Secure password hashing with bcrypt
- 🔄 Continuous Integration with GitHub Actions
- 🖼️ File uploads with Cloudinary integration
- 🎨 Profile picture management with image optimization

## Prerequisites

- Node.js (v20 or higher required)
- PNPM package manager
- Docker and Docker Compose (for local database)
- Cloudinary account (for file uploads)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd nest-starter
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

   - Database settings
   - JWT secret
   - SendGrid credentials
   - Cloudinary credentials (get these from your Cloudinary dashboard)

5. Start the database:

```bash
docker-compose up -d
```

6. Start the development server:

```bash
pnpm start:dev
```

The application will be available at `http://localhost:3000`.

## Scripts

- `pnpm start` - Start the application
- `pnpm start:dev` - Start the application in watch mode
- `pnpm start:debug` - Start the application in debug mode
- `pnpm start:prod` - Start the production build
- `pnpm build` - Build the application
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Run tests with coverage
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Lint the code
- `pnpm format` - Format the code

## Project Structure

```
src/
├── contexts/           # Business logic organized by domain contexts
│   ├── auth/          # Authentication and authorization
│   ├── user/          # User management
│   └── shared/        # Shared modules and utilities
├── common/            # Common utilities and helpers
├── config/           # Application configuration
├── app.module.ts     # Root application module
└── main.ts          # Application entry point

test/                # Test files
```

## Development

### Configuration

The project uses environment variables for configuration. Required variables include:

#### Database Configuration

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name

#### JWT Configuration

- `JWT_SECRET` - Secret key for JWT tokens

#### SendGrid Configuration

- `SENDGRID_API_KEY` - SendGrid API key
- `SENDGRID_FROM_EMAIL` - Verified sender email

#### Cloudinary Configuration

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### File Upload Features

The project includes a complete file upload system using Cloudinary:

- Secure file uploads with size and type validation
- Image optimization and transformation
- Automatic cleanup of old files
- Support for common image formats (jpg, jpeg, png, gif)
- File size limit of 5MB
- Automatic image resizing and optimization
- Profile picture management for users

### Database Setup

The project uses PostgreSQL as its database. A Docker Compose configuration is included for local development:

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# Stop the database and remove data
docker-compose down -v
```

Default database configuration:

- Host: localhost
- Port: 5432
- Database: nest_db
- Username: postgres
- Password: postgres

### Authentication

The authentication system includes:

- JWT-based authentication with refresh token support
  - Access tokens for short-term authentication
  - Refresh tokens for obtaining new access tokens
  - Secure token rotation on refresh
  - Refresh token invalidation on logout
- Local strategy for username/password login
- Password hashing with bcrypt
- Protected routes with Guards
- Role-based access control
- CSRF protection for all mutating requests
- Rate limiting to prevent brute force attacks

Authentication flow:

1. User logs in with credentials
2. Server provides access token and refresh token
3. Access token is used for API requests
4. When access token expires, refresh token can be used to obtain new tokens
5. On logout, user's refresh token is invalidated

Available endpoints:

- POST `/auth/login` - Authenticate user and receive tokens
- POST `/auth/refresh` - Get new access token using refresh token
- POST `/auth/logout` - Invalidate refresh token
- GET `/auth/me` - Get current user profile

### Security Features

The project implements various security measures:

#### CSRF Protection

- Double-submit cookie pattern implementation
- Automatic CSRF token generation and validation
- Protected mutations (POST, PUT, DELETE requests)
- Secure token storage with HTTP-only cookies
- Token validation middleware
- Production-ready secure cookie configurations

#### Rate Limiting

- Request rate limiting with ThrottlerModule
- Customizable limits per endpoint
- IP-based rate limiting
- Protection against brute force attacks

#### Additional Security Measures

- Helmet middleware for secure HTTP headers
- CORS protection with configurable origins
- Secure session handling
- HTTP-only cookies for sensitive data
- Strict content security policy
- XSS protection headers
- Secure password hashing with bcrypt
- Input validation and sanitization
- Request size limits
- Secure error handling

### Code Style

The project uses ESLint and Prettier for code formatting and linting. Configuration files are included:

- `.prettierrc` - Prettier configuration
- `eslint.config.mjs` - ESLint configuration

### Git Hooks

Husky is configured with the following hooks:

- Pre-commit: Runs linting and formatting on staged files
- Commit message: Validates conventional commit format

### Testing

Tests are written using Jest. The configuration can be found in:

- `jest` section in `package.json` for unit tests
- `test/jest-e2e.json` for end-to-end tests

Tests are automatically run on every push and pull request through GitHub Actions. You can view the test results in the Actions tab of the repository.

The CI pipeline:

- Runs on Ubuntu latest with Node.js 20.x
- Uses PNPM for efficient dependency management
- Caches dependencies for faster builds
- Executes all unit tests
- Reports test results in the GitHub UI

You can run tests locally using:

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run end-to-end tests
pnpm test:e2e
```

### API Testing with Postman

The project includes a comprehensive Postman collection for testing the API endpoints:

- `postman/nest-starter.postman_collection.json` - API endpoints collection
- `postman/nest-starter.postman_environment.json` - Environment variables

To use the Postman collection:

1. Import both files into Postman
2. Select the "Nest Starter Local" environment
3. Update the environment variables if needed (default URL is `http://localhost:3000`)
4. Use the provided endpoints to test the API

The collection includes:

- Authentication endpoints (register, login)
- Automatic access token management
- CSRF token handling and validation
- Environment variable handling
- Test scripts for response validation

### API Documentation with Swagger

The API documentation is automatically generated using Swagger/OpenAPI. Once the application is running, you can access the interactive API documentation at:

```
http://localhost:3000/api
```

The Swagger UI provides:

- Detailed API endpoint documentation
- Request/response schemas
- Interactive API testing interface
- Authentication support
- Models and DTOs documentation
- API endpoint examples

## Security Scanning

This project uses Snyk for security scanning. To enable security scanning in your fork:

1. Sign up for a free account at [Snyk.io](https://snyk.io)
2. Get your Snyk API token from Account Settings
3. Add the token as a repository secret in GitHub:
   - Go to your repository Settings
   - Navigate to Secrets and Variables > Actions
   - Create a new secret named `SNYK_TOKEN`
   - Paste your Snyk API token as the value

The security workflow will:

- Scan dependencies for vulnerabilities
- Perform static code analysis
- Run weekly security checks
- Monitor your project for new vulnerabilities
- Show results in GitHub's Security tab

To run security checks locally:

```bash
pnpm run security:check  # Run vulnerability and code tests
pnpm run snyk:test      # Check for vulnerabilities
pnpm run snyk:monitor   # Monitor project in Snyk dashboard
```

## License

[MIT](LICENSE)

## Author

Benjamin Choron <contact@benjamin-choron.com>
