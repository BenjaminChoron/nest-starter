import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserProfileCommand } from '../update-user-profile.command';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/user.repository';
import { UserNotFoundException } from '../../../../shared/application/exceptions/user-not-found.exception';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    const { id, firstName, lastName, profilePicture, phone, address } = command;
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.updateProfile(firstName, lastName, profilePicture, phone, address);
    await this.userRepository.save(user);
  }
}
