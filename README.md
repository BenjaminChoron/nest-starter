# NestJS Starter

[![NestJS](https://img.shields.io/badge/NestJS-v11-ea2845.svg)](https://nestjs.com/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PNPM](https://img.shields.io/badge/pnpm-latest-orange.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)]()

A modern, well-structured NestJS starter template with best practices and essential tooling pre-configured.

## Features

- 🚀 Built with [NestJS](https://nestjs.com/) v11
- 📦 PNPM for fast, disk-efficient package management
- 🔒 Authentication ready with JWT and Passport strategies
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

## Prerequisites

- Node.js (v18 or higher recommended)
- PNPM package manager
- Docker and Docker Compose (for local database)

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

4. Start the database:

```bash
docker-compose up -d
```

5. Start the development server:

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

- JWT-based authentication
- Local strategy for username/password login
- Password hashing with bcrypt
- Protected routes with Guards
- Role-based access control

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

## License

[UNLICENSED]

## Author

Benjamin Choron <contact@benjamin-choron.com>
