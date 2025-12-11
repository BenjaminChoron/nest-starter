import { Test, TestingModule } from '@nestjs/testing';
import { CompleteProfileHandler } from './complete-profile.handler';
import { CompleteProfileCommand } from '../commands/complete-profile.command';
import {
  IUserRepository as IAuthUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import {
  IUserRepository as IUserProfileRepository,
  USER_REPOSITORY as USER_PROFILE_REPOSITORY,
} from '../../../user/domain/user.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User as AuthUser } from '../../domain/entities/user.entity';

jest.mock('../../domain/value-objects/password.value-object', () => ({
  Password: {
    create: jest.fn().mockResolvedValue({
      toString: () => 'hashed_password',
    }),
  },
}));

jest.mock('../../../user/domain/value-objects/email.value-object', () => ({
  Email: {
    create: jest.fn().mockReturnValue({
      toString: () => 'test@example.com',
    }),
  },
}));

jest.mock('../../../user/domain/value-objects/phone.value-object', () => ({
  Phone: {
    create: jest.fn().mockReturnValue({
      toString: () => '+1234567890',
    }),
  },
}));

jest.mock('../../../user/domain/value-objects/address.value-object', () => ({
  Address: {
    create: jest.fn().mockReturnValue({
      toString: () => '123 Main St',
    }),
  },
}));

describe('CompleteProfileHandler', () => {
  let handler: CompleteProfileHandler;
  let authUserRepository: jest.Mocked<IAuthUserRepository>;
  let userProfileRepository: jest.Mocked<IUserProfileRepository>;

  const mockToken = 'valid-token';
  const mockPassword = 'NewP@ss123';
  const mockFirstName = 'John';
  const mockLastName = 'Doe';
  const mockPhone = '+1234567890';
  const mockAddress = '123 Main St';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteProfileHandler,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByProfileCreationToken: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: USER_PROFILE_REPOSITORY,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CompleteProfileHandler>(CompleteProfileHandler);
    authUserRepository = module.get(USER_REPOSITORY);
    userProfileRepository = module.get(USER_PROFILE_REPOSITORY);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should complete profile successfully', async () => {
      // Arrange
      const mockAuthUser = {
        id: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        isProfileCreationTokenValid: jest.fn().mockReturnValue(true),
        setPassword: jest.fn().mockResolvedValue(undefined),
        verify: jest.fn(),
        clearProfileCreationToken: jest.fn(),
      } as unknown as AuthUser;

      const findByProfileCreationToken = jest.fn().mockResolvedValue(mockAuthUser);
      const saveAuthUser = jest.fn();
      const saveProfile = jest.fn();

      authUserRepository.findByProfileCreationToken = findByProfileCreationToken;
      authUserRepository.save = saveAuthUser;
      userProfileRepository.save = saveProfile;

      const command = new CompleteProfileCommand(
        mockToken,
        mockPassword,
        mockFirstName,
        mockLastName,
        undefined,
        mockPhone,
        mockAddress,
      );

      // Act
      await handler.execute(command);

      // Assert
      expect(findByProfileCreationToken).toHaveBeenCalledWith(mockToken);
      expect(setPasswordMock).toHaveBeenCalledWith(mockPassword);
      expect(verifyMock).toHaveBeenCalled();
      expect(clearProfileCreationTokenMock).toHaveBeenCalled();
      expect(saveAuthUser).toHaveBeenCalled();
      expect(saveProfile).toHaveBeenCalled();
    });

    it('should throw NotFoundException when token is invalid', async () => {
      // Arrange
      const findByProfileCreationToken = jest.fn().mockResolvedValue(null);
      const saveAuthUser = jest.fn();
      const saveProfile = jest.fn();

      authUserRepository.findByProfileCreationToken = findByProfileCreationToken;
      authUserRepository.save = saveAuthUser;
      userProfileRepository.save = saveProfile;

      const command = new CompleteProfileCommand(mockToken, mockPassword, mockFirstName, mockLastName);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException('Invalid or expired profile creation token'),
      );
      expect(saveAuthUser).not.toHaveBeenCalled();
      expect(saveProfile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when token has expired', async () => {
      // Arrange
      const mockAuthUser = {
        isProfileCreationTokenValid: jest.fn().mockReturnValue(false),
      } as unknown as AuthUser;

      const findByProfileCreationToken = jest.fn().mockResolvedValue(mockAuthUser);
      const saveAuthUser = jest.fn();
      const saveProfile = jest.fn();

      authUserRepository.findByProfileCreationToken = findByProfileCreationToken;
      authUserRepository.save = saveAuthUser;
      userProfileRepository.save = saveProfile;

      const command = new CompleteProfileCommand(mockToken, mockPassword, mockFirstName, mockLastName);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new BadRequestException('Profile creation token has expired'),
      );
      expect(saveAuthUser).not.toHaveBeenCalled();
      expect(saveProfile).not.toHaveBeenCalled();
    });

    it('should create profile without optional fields', async () => {
      // Arrange
      const setPasswordMock = jest.fn().mockResolvedValue(undefined);
      const verifyMock = jest.fn();
      const clearProfileCreationTokenMock = jest.fn();
      const mockAuthUser = {
        id: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        isProfileCreationTokenValid: jest.fn().mockReturnValue(true),
        setPassword: setPasswordMock,
        verify: verifyMock,
        clearProfileCreationToken: clearProfileCreationTokenMock,
      } as unknown as AuthUser;

      const findByProfileCreationToken = jest.fn().mockResolvedValue(mockAuthUser);
      const saveAuthUser = jest.fn();
      const saveProfile = jest.fn();

      authUserRepository.findByProfileCreationToken = findByProfileCreationToken;
      authUserRepository.save = saveAuthUser;
      userProfileRepository.save = saveProfile;

      const command = new CompleteProfileCommand(mockToken, mockPassword, mockFirstName, mockLastName);

      // Act
      await handler.execute(command);

      // Assert
      expect(saveProfile).toHaveBeenCalled();
    });
  });
});
