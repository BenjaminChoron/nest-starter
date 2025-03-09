import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LocalStrategy } from './local.strategy';
import { LoginUserCommand } from '../../application/commands/login-user.command';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const mockAccessToken = { access_token: 'test-token' };

    it('should return access token on successful validation', async () => {
      const executeSpy = jest.spyOn(commandBus, 'execute').mockResolvedValue(mockAccessToken);

      const result = await strategy.validate(testEmail, testPassword);

      expect(executeSpy).toHaveBeenCalledWith(new LoginUserCommand(testEmail, testPassword));
      expect(result).toEqual(mockAccessToken);
    });

    it('should throw UnauthorizedException when login fails with error message', async () => {
      const errorMessage = 'Invalid credentials';
      jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error(errorMessage));

      await expect(strategy.validate(testEmail, testPassword)).rejects.toThrow(new UnauthorizedException(errorMessage));
    });

    it('should throw UnauthorizedException with default message for unknown errors', async () => {
      jest.spyOn(commandBus, 'execute').mockRejectedValue('Unknown error');

      await expect(strategy.validate(testEmail, testPassword)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });
});
