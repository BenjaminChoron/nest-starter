import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserHandler } from './login-user.handler';
import { LoginUserCommand } from '../commands/login-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UnauthorizedException } from '@nestjs/common';
import { testData, createTestUser, createVerifiedTestUser } from '../../../../../test/test.helper';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

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
      const mockUser = await createVerifiedTestUser();
      const { email, password } = testData.users.validUser;
      const { validAccessToken: mockAccessToken, validRefreshToken: mockRefreshToken } = testData.tokens;

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
      configService.getOrThrow
        .mockReturnValueOnce('1h') // JWT_ACCESS_TOKEN_TTL
        .mockReturnValueOnce('mock-refresh-secret') // JWT_REFRESH_SECRET
        .mockReturnValueOnce('7d'); // JWT_REFRESH_TOKEN_TTL

      const command = new LoginUserCommand(email, password);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email.toString(),
          roles: mockUser.roles,
          isEmailVerified: mockUser.isEmailVerified,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const { email, password } = testData.users.validUser;
      userRepository.findByEmail.mockResolvedValue(null);
      const command = new LoginUserCommand(email, password);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      // Arrange
      const mockUser = await createTestUser(); // Creates an unverified user
      const { email, password } = testData.users.validUser;

      userRepository.findByEmail.mockResolvedValue(mockUser);
      const command = new LoginUserCommand(email, password);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new UnauthorizedException('Please verify your email address before logging in'),
      );
    });

    it('should generate tokens with correct payload and expiration', async () => {
      // Arrange
      const mockUser = await createVerifiedTestUser();
      const { email, password } = testData.users.validUser;
      const { validAccessToken: mockAccessToken, validRefreshToken: mockRefreshToken } = testData.tokens;
      const mockRefreshTokenId = 'mock-refresh-token-id';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
      configService.getOrThrow
        .mockReturnValueOnce('1h') // JWT_ACCESS_TOKEN_TTL
        .mockReturnValueOnce('mock-refresh-secret') // JWT_REFRESH_SECRET
        .mockReturnValueOnce('7d'); // JWT_REFRESH_TOKEN_TTL

      // @ts-expect-error: private method mock
      handler.generateRefreshTokenId = jest.fn().mockReturnValue(mockRefreshTokenId);

      const command = new LoginUserCommand(email, password);

      // Act
      await handler.execute(command);

      // Assert
      const [accessTokenCall, refreshTokenCall] = jwtService.signAsync.mock.calls;

      expect(accessTokenCall[0]).toEqual({
        sub: mockUser.id,
        email: mockUser.email.toString(),
        roles: mockUser.roles,
        isEmailVerified: mockUser.isEmailVerified,
      });
      expect(accessTokenCall[1]).toEqual({ expiresIn: '1h' });

      expect(refreshTokenCall[0]).toEqual({
        sub: mockUser.id,
        refreshToken: mockRefreshTokenId,
      });
      expect(refreshTokenCall[1]).toEqual({
        expiresIn: '7d',
        secret: 'mock-refresh-secret',
      });
    });
  });
});
