import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserProfileCommand } from '../update-user-profile.command';
import { UserRepository, USER_REPOSITORY } from '../../../domain/user.repository';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    const { id, firstName, lastName, profilePicture, phone, address } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateProfile(firstName, lastName, profilePicture, phone, address);
    await this.userRepository.update(user);
  }
}
