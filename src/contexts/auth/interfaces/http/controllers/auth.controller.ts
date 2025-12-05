import { Body, Controller, Post, UseGuards, Type, HttpCode, HttpStatus, Get, Query, Request } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../../application/commands/register-user.command';
import { LoginUserCommand } from '../../../application/commands/login-user.command';
import { VerifyEmailCommand } from '../../../application/commands/verify-email.command';
import { RequestPasswordResetCommand } from '../../../application/commands/request-password-reset.command';
import { ResetPasswordCommand } from '../../../application/commands/reset-password.command';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CustomThrottlerGuard } from '../../../../shared/infrastructure/guards/throttler.guard';
import { GetUserByIdQuery } from '../../../../user/application/queries/get-user-by-id.query';
import { User } from '../../../../user/domain/user.entity';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  AuthCredentialsDto,
  RegisterResponseDto,
  LoginResponseDto,
  CurrentUserResponseDto,
  JwtPayload,
  UserDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dtos/auth.dto';
import { LogoutUserCommand } from '../../../application/commands/logout-user.command';

interface RefreshTokenResult {
  access_token: string;
  refresh_token: string;
  user: UserDto;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(CustomThrottlerGuard)
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sends a verification email to the provided email address.',
  })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiCreatedResponse({
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

  @UseGuards(CustomThrottlerGuard, LocalAuthGuard as Type<LocalAuthGuard>)
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

  @UseGuards(CustomThrottlerGuard)
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
    description: 'Retrieves the complete profile information of the currently authenticated user.',
  })
  @ApiOkResponse({
    type: CurrentUserResponseDto,
    description: 'Current user profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token',
  })
  async getCurrentUser(@Request() req: { user: JwtPayload }): Promise<CurrentUserResponseDto> {
    const { sub: id, email, roles, isEmailVerified } = req.user;

    // Fetch complete user details
    const query = new GetUserByIdQuery(id);
    const userDetails = await this.queryBus.execute<GetUserByIdQuery, User>(query);

    return {
      id,
      email,
      roles,
      isEmailVerified,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      profilePicture: userDetails.profilePicture,
      phone: userDetails.phone,
      address: userDetails.address,
    };
  }

  @Post('refresh')
  @UseGuards(CustomThrottlerGuard, RefreshTokenGuard as Type<RefreshTokenGuard>)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token.',
  })
  @ApiBearerAuth('JWT-refresh')
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Successfully refreshed access token.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(@Request() req: { user: RefreshTokenResult }): Promise<LoginResponseDto> {
    const result = await Promise.resolve({
      access_token: req.user.access_token,
      refresh_token: req.user.refresh_token,
      user: req.user.user,
    });
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates the refresh token for the current user.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Successfully logged out.',
  })
  async logout(@Request() req: { user: JwtPayload }): Promise<{ message: string }> {
    await this.commandBus.execute(new LogoutUserCommand(req.user.sub));
    return { message: 'Successfully logged out' };
  }

  @UseGuards(CustomThrottlerGuard)
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the provided email address.',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiOkResponse({
    description: 'Password reset email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset instructions have been sent to your email',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email address',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<{ message: string }> {
    await this.commandBus.execute(new RequestPasswordResetCommand(dto.email));
    return { message: 'Password reset instructions have been sent to your email' };
  }

  @UseGuards(CustomThrottlerGuard)
  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the password using the token received via email.',
  })
  @ApiQuery({
    name: 'token',
    description: 'Password reset token received via email',
    required: true,
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'New password',
  })
  @ApiOkResponse({
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password has been reset successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired reset token',
  })
  async resetPassword(@Query('token') token: string, @Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.commandBus.execute(new ResetPasswordCommand(token, dto.password));
    return { message: 'Password has been reset successfully' };
  }
}
