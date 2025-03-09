import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from '../commands/register-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserAlreadyExistsException } from '../../../shared/application/exceptions/user-already-exists.exception';
import { Email } from '../../domain/value-objects/email.value-object';
import { User } from '../../domain/entities/user.entity';

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mocked-uuid'),
}));

jest.mock('../../domain/value-objects/password.value-object', () => ({
  Password: {
    create: jest.fn().mockResolvedValue({
      toString: () => 'hashed_password',
      verify: jest.fn().mockResolvedValue(true),
    }),
  },
}));

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let eventBus: EventBus;

  const mockEmail = 'test@example.com';
  const mockPassword = 'StrongP@ss123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserHandler,
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
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
    userRepository = module.get(USER_REPOSITORY);
    eventBus = module.get<EventBus>(EventBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue(null);
      const save = jest.fn();
      const publish = jest.fn();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;
      eventBus.publish = publish;

      const command = new RegisterUserCommand(mockEmail, mockPassword);

      // Act
      await handler.execute(command);

      // Assert
      expect(findByEmail).toHaveBeenCalledWith(expect.any(Email));
      expect(save).toHaveBeenCalledWith(expect.any(User));
      expect(publish).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid',
          email: mockEmail,
          verificationToken: 'mocked-uuid',
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

      const command = new RegisterUserCommand(mockEmail, mockPassword);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new UserAlreadyExistsException(mockEmail));
      expect(save).not.toHaveBeenCalled();
      expect(publish).not.toHaveBeenCalled();
    });

    it('should set verification token with 24 hour expiration', async () => {
      // Arrange
      const findByEmail = jest.fn().mockResolvedValue(null);
      const save = jest.fn<Promise<void>, [User]>();

      userRepository.findByEmail = findByEmail;
      userRepository.save = save;

      const command = new RegisterUserCommand(mockEmail, mockPassword);

      // Act
      await handler.execute(command);

      // Assert
      expect(save).toHaveBeenCalled();
      const [savedUser] = save.mock.calls[0];
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.id).toBe('mocked-uuid');

      const now = new Date();
      const tokenExpiresAt = savedUser.verificationTokenExpiresAt;
      expect(tokenExpiresAt).toBeDefined();
      expect(tokenExpiresAt).toBeInstanceOf(Date);

      if (tokenExpiresAt) {
        const hoursDiff = Math.round((tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
        expect(hoursDiff).toBe(24);
      }
    });
  });
});
