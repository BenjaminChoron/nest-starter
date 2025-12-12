import { Test } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RequestPasswordResetHandler } from '../request-password-reset.handler';
import { ResetPasswordHandler } from '../reset-password.handler';
import { RequestPasswordResetCommand } from '../../commands/request-password-reset.command';
import { ResetPasswordCommand } from '../../commands/reset-password.command';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.value-object';
import { PasswordResetRequestedEvent } from '../../../domain/events/password-reset-requested.event';

interface MockUser {
  id: string;
  email: string;
  setPasswordResetToken: jest.Mock;
  isPasswordResetTokenValid: jest.Mock;
  setPassword: jest.Mock;
  clearPasswordResetToken: jest.Mock;
}

interface MockUserRepository {
  findByEmail: jest.Mock;
  findByPasswordResetToken: jest.Mock;
  save: jest.Mock;
}

interface MockEventBus {
  publish: jest.Mock;
}

describe('Password Reset Handlers', () => {
  let requestPasswordResetHandler: RequestPasswordResetHandler;
  let resetPasswordHandler: ResetPasswordHandler;
  let userRepository: MockUserRepository;
  let eventBus: MockEventBus;

  const createMockUser = (): MockUser => ({
    id: 'test-user-id',
    email: 'test@example.com',
    setPasswordResetToken: jest.fn(),
    isPasswordResetTokenValid: jest.fn(),
    setPassword: jest.fn(),
    clearPasswordResetToken: jest.fn(),
  });

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findByPasswordResetToken: jest.fn(),
      save: jest.fn(),
    };

    eventBus = {
      publish: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RequestPasswordResetHandler,
        ResetPasswordHandler,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
        {
          provide: EventBus,
          useValue: eventBus,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(1), // PASSWORD_RESET_TOKEN_TTL_HOURS default
          },
        },
      ],
    }).compile();

    requestPasswordResetHandler = moduleRef.get<RequestPasswordResetHandler>(RequestPasswordResetHandler);
    resetPasswordHandler = moduleRef.get<ResetPasswordHandler>(ResetPasswordHandler);
  });

  describe('RequestPasswordResetHandler', () => {
    it('should generate reset token and publish event for existing user', async () => {
      // Arrange
      const mockUser = createMockUser();
      const email = 'test@example.com';
      const command = new RequestPasswordResetCommand(email);
      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(undefined);

      // Act
      await requestPasswordResetHandler.execute(command);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(expect.any(Email));
      expect(mockUser.setPasswordResetToken).toHaveBeenCalledWith(expect.any(String), expect.any(Date));
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(eventBus.publish).toHaveBeenCalledWith(expect.any(PasswordResetRequestedEvent));
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const command = new RequestPasswordResetCommand(email);
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(requestPasswordResetHandler.execute(command)).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('ResetPasswordHandler', () => {
    it('should reset password for valid token', async () => {
      // Arrange
      const mockUser = createMockUser();
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';
      const command = new ResetPasswordCommand(token, newPassword);
      mockUser.isPasswordResetTokenValid.mockReturnValue(true);
      userRepository.findByPasswordResetToken.mockResolvedValue(mockUser);

      // Act
      await resetPasswordHandler.execute(command);

      // Assert
      expect(userRepository.findByPasswordResetToken).toHaveBeenCalledWith(token);
      expect(mockUser.isPasswordResetTokenValid).toHaveBeenCalled();
      expect(mockUser.setPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUser.clearPasswordResetToken).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException for invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      const newPassword = 'NewPassword123!';
      const command = new ResetPasswordCommand(token, newPassword);
      userRepository.findByPasswordResetToken.mockResolvedValue(null);

      // Act & Assert
      await expect(resetPasswordHandler.execute(command)).rejects.toThrow(BadRequestException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for expired token', async () => {
      // Arrange
      const mockUser = createMockUser();
      const token = 'expired-token';
      const newPassword = 'NewPassword123!';
      const command = new ResetPasswordCommand(token, newPassword);
      mockUser.isPasswordResetTokenValid.mockReturnValue(false);
      userRepository.findByPasswordResetToken.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(resetPasswordHandler.execute(command)).rejects.toThrow(BadRequestException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
