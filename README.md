# NestJS Starter

[![NestJS](https://img.shields.io/badge/NestJS-v11.0.10-ea2845.svg)](https://nestjs.com/)
[![Node](https://img.shields.io/badge/Node-%3E%3D22-brightgreen.svg)](https://nodejs.org)
[![PNPM](https://img.shields.io/badge/pnpm-latest-orange.svg)](https://pnpm.io/)
[![CI](https://github.com/BenjaminChoron/nest-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/BenjaminChoron/nest-starter/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

A modern, well-structured NestJS starter template with best practices and essential tooling pre-configured.

## Features

### Core Framework & Architecture

- 🚀 Built with [NestJS](https://nestjs.com/) v11
- 📦 PNPM for fast, disk-efficient package management
- 🏗️ CQRS architecture with domain-driven design
- 🔄 Hot reload in development

### Authentication & Authorization

- 🔒 JWT-based authentication with Passport strategies
- 🔄 Refresh token support with secure token rotation
- 👑 Role-based access control (superAdmin, admin, user)
- 🎫 User invitation system (SuperAdmin can invite users)
- 📧 Email verification workflow
- 📝 Profile creation workflow for invited users
- 🔐 Secure password hashing with bcrypt

### Security

- 🛡️ CSRF protection with double-submit cookie pattern
- 🔐 Rate limiting and brute force protection
- 🔒 Secure HTTP headers with Helmet
- 🚫 CORS protection with configurable origins
- ✅ Input validation and sanitization

### Database & Storage

- 🗃️ PostgreSQL database with TypeORM integration
- 🖼️ File uploads with Cloudinary integration
- 🎨 Profile picture management with image optimization
- 📊 Database migrations support

### Email & Notifications

- 📧 SMTP email integration
- ✉️ Email templates (verification, password reset, profile creation)
- 📨 Automated email workflows

### Development Tools

- ✨ ESLint + Prettier for code quality
- 🪝 Git hooks with Husky and lint-staged
- 📋 Conventional commits with commitlint
- 🐳 Docker Compose for local development

### Testing & CI/CD

- 🧪 Jest for unit and integration testing
- 🔄 Continuous Integration with GitHub Actions
- 📊 Test coverage reporting

### Documentation

- 📝 OpenAPI/Swagger API documentation
- 📚 Comprehensive README with examples
- 🧪 Postman collection for API testing

## Prerequisites

- Node.js (v22 or higher required)
- PNPM package manager
- Docker and Docker Compose (for local database)
- Cloudinary account (for file uploads)
- SMTP credentials (for email sending)

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
   - SMTP credentials
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

The project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

#### Application Configuration

- `NODE_ENV` - Environment mode (development, production, test). Default: `development`
- `PORT` - Server port. Default: `3000`

#### Database Configuration

- `DB_HOST` - Database host. Default: `localhost`
- `DB_PORT` - Database port. Default: `5432`
- `DB_USERNAME` - Database username. Default: `postgres`
- `DB_PASSWORD` - Database password. Default: `postgres`
- `DB_NAME` - Database name. Default: `nest_db`
- `DB_SYNCHRONIZE` - (Optional) Enable TypeORM auto-synchronization. Overrides NODE_ENV default
- `DB_LOGGING` - (Optional) Enable database query logging. Overrides NODE_ENV default

#### JWT Configuration

- `JWT_SECRET` - **Required** - Secret key for JWT access tokens
- `JWT_ACCESS_TOKEN_TTL` - Access token expiration time (e.g., `1h`, `15m`). Default: `1h`
- `JWT_REFRESH_SECRET` - **Required** - Secret key for JWT refresh tokens
- `JWT_REFRESH_TOKEN_TTL` - Refresh token expiration time (e.g., `7d`, `14d`). Default: `7d`

#### Token Expiration Configuration (Optional)

- `EMAIL_VERIFICATION_TOKEN_TTL_HOURS` - Email verification token expiration in hours. Default: `24`
- `PASSWORD_RESET_TOKEN_TTL_HOURS` - Password reset token expiration in hours. Default: `1`
- `PROFILE_CREATION_TOKEN_TTL_DAYS` - Profile creation token expiration in days. Default: `7`
- `REFRESH_TOKEN_TTL_DAYS` - Refresh token expiration in days (should match JWT_REFRESH_TOKEN_TTL). Default: `7`

#### SMTP Configuration

- `SMTP_HOST` - **Required** - SMTP server host
- `SMTP_PORT` - SMTP server port. Default: `587`
- `SMTP_USER` - **Required** - SMTP username
- `SMTP_PASS` - **Required** - SMTP password
- `SMTP_FROM` - **Required** - Default "from" email address
- `SMTP_SECURE` - Use secure connection (SSL/TLS). Default: `false`
- `SMTP_IGNORE_TLS` - Ignore TLS certificate errors. Default: `false`
- `SMTP_REQUIRE_TLS` - Require TLS connection. Default: `true`
- `SMTP_MAX_CONNECTIONS` - Maximum SMTP connections in pool. Default: `5`
- `SMTP_MAX_MESSAGES` - Maximum messages per connection. Default: `100`
- `SMTP_RATE_DELTA` - Rate limit time window in milliseconds. Default: `1000`
- `SMTP_RATE_LIMIT` - Maximum messages per rate window. Default: `10`

#### Frontend Configuration

- `FRONTEND_URL` - **Required** - Frontend URL for email links (e.g., `http://localhost:4200`)

#### CORS Configuration (Optional)

- `CORS_ORIGIN` - Allowed origins (comma-separated). If not set, allows all origins
- `CORS_CREDENTIALS` - Allow credentials. Default: `true`
- `CORS_METHODS` - Allowed HTTP methods (comma-separated). Default: `GET,POST,PUT,DELETE,PATCH,OPTIONS`

#### Swagger Configuration (Optional)

- `SWAGGER_SERVER_URL` - Swagger server URL. Default: `http://localhost:3000`
- `SWAGGER_CONTACT_NAME` - Swagger contact name. Default: `Benjamin Choron`
- `SWAGGER_CONTACT_URL` - Swagger contact URL. Default: `https://benjamin-choron.com`
- `SWAGGER_CONTACT_EMAIL` - Swagger contact email. Default: `contact@benjamin-choron.com`

#### Throttler Configuration (Optional)

- `THROTTLE_SHORT_TTL` - Short throttle time window in milliseconds. Default: `1000` (1 second)
- `THROTTLE_SHORT_LIMIT` - Short throttle request limit. Default: `3`
- `THROTTLE_MEDIUM_TTL` - Medium throttle time window in milliseconds. Default: `60000` (1 minute)
- `THROTTLE_MEDIUM_LIMIT` - Medium throttle request limit. Default: `10`
- `THROTTLE_LONG_TTL` - Long throttle time window in milliseconds. Default: `3600000` (1 hour)
- `THROTTLE_LONG_LIMIT` - Long throttle request limit. Default: `100`

#### Cloudinary Configuration

- `CLOUDINARY_CLOUD_NAME` - **Required** - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - **Required** - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - **Required** - Your Cloudinary API secret
- `CLOUDINARY_DEFAULT_FOLDER` - Default folder for uploads. Default: `profile-pictures`
- `CLOUDINARY_IMAGE_WIDTH` - Default image width in pixels. Default: `500`
- `CLOUDINARY_IMAGE_HEIGHT` - Default image height in pixels. Default: `500`
- `CLOUDINARY_IMAGE_QUALITY` - Default image quality. Default: `auto:good`

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
docker compose up -d

# Stop the database
docker compose down

# Stop the database and remove data
docker compose down -v
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
- Role-based access control (superAdmin, admin, user)
- CSRF protection for all mutating requests
- Rate limiting to prevent brute force attacks

#### Roles

The system supports three roles:

- **superAdmin**: The first user created in the database automatically receives this role. SuperAdmin has exclusive privileges:
  - Can invite new users (provides email and role)
  - Can update user roles (admin/user only)
  - Cannot have their role modified
  - **Can access all admin-only endpoints** (superAdmin can do everything admin can do)
- **admin**: Can access admin-only endpoints (e.g., get all users)
- **user**: Standard user role with basic access

#### Authentication Flow

**Standard Registration:**

1. User registers with email and password (`POST /auth/register`)
2. First user automatically becomes superAdmin
3. User receives verification email
4. User verifies email (`GET /auth/verify?token=...`)
5. User logs in (`POST /auth/login`)
6. Server provides access token and refresh token
7. Access token is used for API requests
8. When access token expires, refresh token can be used to obtain new tokens (`POST /auth/refresh`)
9. On logout, user's refresh token is invalidated (`POST /auth/logout`)

**User Invitation Flow (SuperAdmin Only):**

1. SuperAdmin invites a user (`POST /auth/invite-user`) with email and role (admin/user)
2. System creates user account with temporary password
3. User receives email with profile creation link (token expires in 7 days)
4. User completes profile (`POST /auth/complete-profile?token=...`) with:
   - Password
   - First name
   - Last name
   - Optional: profile picture, phone, address
5. Email is automatically verified
6. User can now login with their credentials

#### Available Endpoints

**Authentication:**

- POST `/auth/register` - Register a new user (first user becomes superAdmin)
- POST `/auth/login` - Authenticate user and receive tokens
- GET `/auth/verify` - Verify email address
- POST `/auth/refresh` - Get new access token using refresh token
- POST `/auth/logout` - Invalidate refresh token
- GET `/auth/me` - Get current user profile
- POST `/auth/password-reset/request` - Request password reset
- POST `/auth/password-reset` - Reset password with token

**SuperAdmin Only:**

- POST `/auth/invite-user` - Invite a new user (requires superAdmin)
- POST `/auth/complete-profile` - Complete user profile with token from invitation email
- PATCH `/users/:id/role` - Update user roles (requires superAdmin)

**User Management:**

- POST `/users` - Create a new user profile (typically used internally)
- GET `/users` - Get all users (requires admin or superAdmin role)
- GET `/users/:id` - Get user by ID (requires authentication)
- PUT `/users/:id` - Update user profile (requires authentication)
- PUT `/users/:id/profile-picture` - Upload profile picture (requires authentication)

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

- Authentication endpoints (register, login, verify email)
- User invitation endpoints (SuperAdmin only)
- Profile completion endpoints
- User management endpoints
- Role management endpoints
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
