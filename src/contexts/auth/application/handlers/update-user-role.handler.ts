import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateUserRoleCommand } from '../commands/update-user-role.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserRoleCommand): Promise<void> {
    const { userId, roles } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate roles - only allow 'admin' and 'user' roles, not 'superAdmin'
    const validRoles = ['admin', 'user'];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestException(
        `Invalid roles: ${invalidRoles.join(', ')}. Only 'admin' and 'user' roles can be assigned.`,
      );
    }

    // Prevent changing superAdmin role
    if (user.roles.includes('superAdmin')) {
      throw new BadRequestException('Cannot modify superAdmin role');
    }

    // Update roles
    user.updateRoles(roles);
    await this.userRepository.save(user);
  }
}
