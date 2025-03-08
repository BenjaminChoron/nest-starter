# NestJS Starter

A modern, well-structured NestJS starter template with best practices and essential tooling pre-configured.

## Features

- 🚀 Built with [NestJS](https://nestjs.com/) v11
- 📦 PNPM for fast, disk-efficient package management
- 🔒 Authentication ready with JWT and Passport
- 📝 OpenAPI/Swagger documentation
- 🏗️ CQRS architecture support
- ✨ ESLint + Prettier for code quality
- 🧪 Jest for testing
- 🪝 Git hooks with Husky
- 📋 Conventional commits with commitlint
- 🔄 Hot reload in development

## Prerequisites

- Node.js (v18 or higher recommended)
- PNPM package manager

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

4. Start the development server:

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
├── contexts/         # Business logic organized by domain contexts
├── app.module.ts     # Root application module
└── main.ts          # Application entry point

test/                # Test files
```

## Development

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

## License

[UNLICENSED]

## Author

Benjamin Choron <contact@benjamin-choron.com>
