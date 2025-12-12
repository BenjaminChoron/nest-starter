import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { InviteUserHandler } from './invite-user.handler';
import { InviteUserCommand } from '../commands/invite-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserAlreadyExistsException } from '../../../shared/application/exceptions/user-already-exists.exception';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

jest.mock('../../domain/value-objects/password.value-object', () => ({
  Password: {
    create: jest.fn().mockResolvedValue({
      toString: () => 'hashed_password',
    }),
  },
}));

describe('InviteUserHandler', () => {
  let handler: InviteUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let eventBus: EventBus;

  const mockEmail = 'invited@example.com';
  const mockRole = 'admin';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(7), // PROFILE_CREATION_TOKEN_TTL_DAYS default
          },
        },
      ],
    }).compile();

    handler = module.get<InviteUserHandler>(InviteUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    eventBus = module.get<EventBus>(EventBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should invite a user successfully with admin role', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue(null);
      const save = jest.fn();
      const publish = jest.fn();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;
      eventBus.publish = publish;

      const command = new InviteUserCommand(mockEmail, 'admin');

      // Act
      await handler.execute(command);

      // Assert
      expect(findByEmail).toHaveBeenCalledWith(expect.any(Email));
      expect(save).toHaveBeenCalledWith(expect.any(User));
      const [savedUser] = save.mock.calls[0] as [User];
      expect(savedUser.roles).toEqual(['admin']);
      expect(savedUser.profileCreationToken).toBe('mocked-uuid');
      expect(publish).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid',
          email: mockEmail,
          role: 'admin',
          profileCreationToken: 'mocked-uuid',
        }),
      );
    });

    it('should invite a user successfully with user role', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue(null);
      const save = jest.fn();
      const publish = jest.fn();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;
      eventBus.publish = publish;

      const command = new InviteUserCommand(mockEmail, 'user');

      // Act
      await handler.execute(command);

      // Assert
      expect(save).toHaveBeenCalled();
      const [savedUser] = save.mock.calls[0] as [User];
      expect(savedUser.roles).toEqual(['user']);
      expect(publish).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'user',
        }),
      );
    });

    it('should throw UserAlreadyExistsException when email is already registered', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue({ id: 'existing-user' } as User);
      const save = jest.fn();
      const publish = jest.fn();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;
      eventBus.publish = publish;

      const command = new InviteUserCommand(mockEmail, mockRole);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new UserAlreadyExistsException(mockEmail));
      expect(save).not.toHaveBeenCalled();
      expect(publish).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid role', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue(null);
      const save = jest.fn();
      const publish = jest.fn();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;
      eventBus.publish = publish;

      const command = new InviteUserCommand(mockEmail, 'invalidRole' as 'admin' | 'user');

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new UnauthorizedException('Invalid role. Role must be either "admin" or "user"'),
      );
      expect(save).not.toHaveBeenCalled();
      expect(publish).not.toHaveBeenCalled();
    });

    it('should set profile creation token with 7 day expiration', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue(null);
      const save = jest.fn<Promise<void>, [User]>();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;

      const command = new InviteUserCommand(mockEmail, mockRole);

      // Act
      await handler.execute(command);

      // Assert
      expect(save).toHaveBeenCalled();
      const [savedUser] = save.mock.calls[0];
      expect(savedUser.profileCreationToken).toBe('mocked-uuid');

      const now = new Date();
      const tokenExpiresAt = savedUser.profileCreationTokenExpiresAt;
      expect(tokenExpiresAt).toBeDefined();
      expect(tokenExpiresAt).toBeInstanceOf(Date);

      if (tokenExpiresAt) {
        const daysDiff = Math.round((tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(7);
      }
    });
  });
});
