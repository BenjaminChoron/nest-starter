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

The project uses environment variables for configuration. Required variables include:

#### Database Configuration

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name

#### JWT Configuration

- `JWT_SECRET` - Secret key for JWT tokens

#### SMTP Configuration

- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_FROM` - Default "from" email address
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FRONTEND_URL` - Frontend URL for email links (e.g., http://localhost:4200)

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
- GET `/users` - Get all users (requires admin role)
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
