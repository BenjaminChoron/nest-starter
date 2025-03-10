import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserHandler } from './login-user.handler';
import { LoginUserCommand } from '../commands/login-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockEmail = 'test@example.com';
  const mockPassword = 'StrongP@ss123';
  const mockHashedPassword = 'hashed_password';
  const mockUserId = 'test-user-id';
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Mock Password.create and verify
    jest.spyOn(Password, 'create').mockResolvedValue({
      toString: () => mockHashedPassword,
      verify: jest.fn().mockResolvedValue(true),
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as Password);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully login a user with valid credentials', async () => {
      // Arrange
      const mockUser = new User(mockUserId, new Email(mockEmail), await Password.create(mockPassword), ['user'], true);

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
      configService.getOrThrow
        .mockReturnValueOnce('1h') // JWT_ACCESS_TOKEN_TTL
        .mockReturnValueOnce('mock-refresh-secret') // JWT_REFRESH_SECRET
        .mockReturnValueOnce('7d'); // JWT_REFRESH_TOKEN_TTL

      const command = new LoginUserCommand(mockEmail, mockPassword);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: {
          id: mockUserId,
          email: mockEmail,
          roles: ['user'],
          isEmailVerified: true,
        },
      });
      expect(userRepository.findByEmail.mock.calls[0][0]).toBeInstanceOf(Email);
      expect(jwtService.signAsync.mock.calls).toHaveLength(2);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      const command = new LoginUserCommand(mockEmail, mockPassword);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        new Email(mockEmail),
        {
          toString: () => 'hashed_password',
          verify: jest.fn().mockResolvedValue(false),
          compare: jest.fn().mockResolvedValue(false),
        } as unknown as Password,
        ['user'],
        true,
      );

      userRepository.findByEmail.mockResolvedValue(mockUser);
      const command = new LoginUserCommand(mockEmail, 'wrong-password');

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      // Arrange
      const mockUser = new User(mockUserId, new Email(mockEmail), await Password.create(mockPassword), ['user'], false);

      userRepository.findByEmail.mockResolvedValue(mockUser);
      const command = new LoginUserCommand(mockEmail, mockPassword);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new UnauthorizedException('Please verify your email address before logging in'),
      );
    });

    it('should generate tokens with correct payload and expiration', async () => {
      // Arrange
      const mockUser = new User(mockUserId, new Email(mockEmail), await Password.create(mockPassword), ['user'], true);
      const mockRefreshTokenId = 'mock-refresh-token-id';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
      configService.getOrThrow
        .mockReturnValueOnce('1h') // JWT_ACCESS_TOKEN_TTL
        .mockReturnValueOnce('mock-refresh-secret') // JWT_REFRESH_SECRET
        .mockReturnValueOnce('7d'); // JWT_REFRESH_TOKEN_TTL
      // @ts-expect-error: private method mock
      handler.generateRefreshTokenId = jest.fn().mockReturnValue(mockRefreshTokenId);

      const command = new LoginUserCommand(mockEmail, mockPassword);

      // Act
      await handler.execute(command);

      // Assert
      const [accessTokenCall, refreshTokenCall] = jwtService.signAsync.mock.calls;

      // Verify access token
      expect(accessTokenCall[0]).toEqual({
        sub: mockUserId,
        email: mockEmail,
        roles: ['user'],
        isEmailVerified: true,
      });
      expect(accessTokenCall[1]).toEqual({ expiresIn: '1h' });

      // Verify refresh token
      expect(refreshTokenCall[0]).toEqual({
        sub: mockUserId,
        refreshToken: mockRefreshTokenId,
      });
      expect(refreshTokenCall[1]).toEqual({
        expiresIn: '7d',
        secret: 'mock-refresh-secret',
      });
    });
  });
});
