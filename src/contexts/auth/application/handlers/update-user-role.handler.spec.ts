import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserRoleHandler } from './update-user-role.handler';
import { UpdateUserRoleCommand } from '../commands/update-user-role.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';

describe('UpdateUserRoleHandler', () => {
  let handler: UpdateUserRoleHandler;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUserId = 'user-id';
  const mockRoles = ['admin'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserRoleHandler,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateUserRoleHandler>(UpdateUserRoleHandler);
    userRepository = module.get(USER_REPOSITORY);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should update user role successfully', async () => {
      // Arrange
      const updateRolesMock = jest.fn();
      const mockUser = {
        id: mockUserId,
        roles: ['user'],
        updateRoles: updateRolesMock,
      } as unknown as User;

      const findById = jest.fn().mockResolvedValue(mockUser);
      const save = jest.fn();

      userRepository.findById = findById;
      userRepository.save = save;

      const command = new UpdateUserRoleCommand(mockUserId, ['admin']);

      // Act
      await handler.execute(command);

      // Assert
      expect(findById).toHaveBeenCalledWith(mockUserId);
      expect(updateRolesMock).toHaveBeenCalledWith(['admin']);
      expect(save).toHaveBeenCalled();
    });

    it('should update user with multiple roles', async () => {
      // Arrange
      const updateRolesMock = jest.fn();
      const mockUser = {
        id: mockUserId,
        roles: ['user'],
        updateRoles: updateRolesMock,
      } as unknown as User;

      const findById = jest.fn().mockResolvedValue(mockUser);
      const save = jest.fn();

      userRepository.findById = findById;
      userRepository.save = save;

      const command = new UpdateUserRoleCommand(mockUserId, ['admin', 'user']);

      // Act
      await handler.execute(command);

      // Assert
      expect(findById).toHaveBeenCalledWith(mockUserId);
      expect(updateRolesMock).toHaveBeenCalledWith(['admin', 'user']);
      expect(save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const findById = jest.fn().mockResolvedValue(null);
      const save = jest.fn();

      userRepository.findById = findById;
      userRepository.save = save;

      const command = new UpdateUserRoleCommand(mockUserId, mockRoles);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new NotFoundException('User not found'));
      expect(save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid role', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        roles: ['user'],
      } as unknown as User;

      const findById = jest.fn().mockResolvedValue(mockUser);
      const save = jest.fn();

      userRepository.findById = findById;
      userRepository.save = save;

      const command = new UpdateUserRoleCommand(mockUserId, ['superAdmin']);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
      expect(save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to modify superAdmin role', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        roles: ['superAdmin'],
      } as unknown as User;

      const findById = jest.fn().mockResolvedValue(mockUser);
      const save = jest.fn();

      userRepository.findById = findById;
      userRepository.save = save;

      const command = new UpdateUserRoleCommand(mockUserId, ['admin']);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(new BadRequestException('Cannot modify superAdmin role'));
      expect(save).not.toHaveBeenCalled();
    });

    it('should allow updating admin to user', async () => {
      // Arrange
      const updateRolesMock = jest.fn();
      const mockUser = {
        id: mockUserId,
        roles: ['admin'],
        updateRoles: updateRolesMock,
      } as unknown as User;

      const findById = jest.fn().mockResolvedValue(mockUser);
      const save = jest.fn();

      userRepository.findById = findById;
      userRepository.save = save;

      const command = new UpdateUserRoleCommand(mockUserId, ['user']);

      // Act
      await handler.execute(command);

      // Assert
      expect(findById).toHaveBeenCalledWith(mockUserId);
      expect(updateRolesMock).toHaveBeenCalledWith(['user']);
      expect(save).toHaveBeenCalled();
    });
  });
});
