import { Body, Controller, Post, UseGuards, Type, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../../application/commands/register-user.command';
import { LoginUserCommand } from '../../../application/commands/login-user.command';
import { VerifyEmailCommand } from '../../../application/commands/verify-email.command';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiTags, ApiOkResponse, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthCredentialsDto, RegisterResponseDto, LoginResponseDto } from '../dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({ type: RegisterResponseDto })
  async register(@Body() credentials: AuthCredentialsDto): Promise<RegisterResponseDto> {
    await this.commandBus.execute(new RegisterUserCommand(credentials.email, credentials.password));
    return { message: 'User registered successfully. Please check your email for verification instructions.' };
  }

  @UseGuards(LocalAuthGuard as Type<LocalAuthGuard>)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({ type: LoginResponseDto })
  async login(@Body() credentials: AuthCredentialsDto): Promise<LoginResponseDto> {
    return this.commandBus.execute<LoginUserCommand, LoginResponseDto>(
      new LoginUserCommand(credentials.email, credentials.password),
    );
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiQuery({ name: 'token', description: 'Email verification token' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  async verifyEmail(@Query('token') token: string): Promise<{ message: string }> {
    await this.commandBus.execute(new VerifyEmailCommand(token));
    return { message: 'Email verified successfully' };
  }
}
