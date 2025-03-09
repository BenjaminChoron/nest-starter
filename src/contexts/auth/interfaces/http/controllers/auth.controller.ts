import { Body, Controller, Post, UseGuards, Type, HttpCode, HttpStatus, Get, Query, Request } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../../application/commands/register-user.command';
import { LoginUserCommand } from '../../../application/commands/login-user.command';
import { VerifyEmailCommand } from '../../../application/commands/verify-email.command';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOkResponse,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import {
  AuthCredentialsDto,
  RegisterResponseDto,
  LoginResponseDto,
  CurrentUserResponseDto,
  JwtPayload,
} from '../dtos/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sends a verification email to the provided email address.',
  })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({
    type: RegisterResponseDto,
    description: 'User successfully registered. A verification email has been sent.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - email already exists or password does not meet requirements',
  })
  async register(@Body() credentials: AuthCredentialsDto): Promise<RegisterResponseDto> {
    await this.commandBus.execute(new RegisterUserCommand(credentials.email, credentials.password));
    return { message: 'User registered successfully. Please check your email for verification instructions.' };
  }

  @UseGuards(LocalAuthGuard as Type<LocalAuthGuard>)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Authenticates a user with email and password, returning a JWT token for subsequent requests.',
  })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Successfully authenticated. Returns a JWT token.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or email not verified',
  })
  async login(@Body() credentials: AuthCredentialsDto): Promise<LoginResponseDto> {
    return this.commandBus.execute<LoginUserCommand, LoginResponseDto>(
      new LoginUserCommand(credentials.email, credentials.password),
    );
  }

  @Get('verify')
  @ApiOperation({
    summary: 'Verify email address',
    description: "Verifies a user's email address using the token sent via email during registration.",
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token received via email',
    required: true,
  })
  @ApiOkResponse({
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email verified successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification token',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async verifyEmail(@Query('token') token: string): Promise<{ message: string }> {
    await this.commandBus.execute(new VerifyEmailCommand(token));
    return { message: 'Email verified successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile information of the currently authenticated user.',
  })
  @ApiOkResponse({
    type: CurrentUserResponseDto,
    description: 'Current user profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token',
  })
  getCurrentUser(@Request() req: { user: JwtPayload }): CurrentUserResponseDto {
    const { sub: id, email, roles, isEmailVerified } = req.user;

    return {
      id,
      email,
      roles,
      isEmailVerified,
    };
  }
}
