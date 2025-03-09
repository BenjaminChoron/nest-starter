import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserProfileCommand } from '../update-user-profile.command';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/user.repository';
import { UserNotFoundException } from '../../../../shared/application/exceptions/user-not-found.exception';
import { CloudinaryService } from '../../../../shared/infrastructure/services/cloudinary.service';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    const { id, firstName, lastName, profilePicture, phone, address, file } = command;
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    let newProfilePicture = profilePicture;

    // Handle file upload if provided
    if (file) {
      // Upload new profile picture
      newProfilePicture = await this.cloudinaryService.uploadImage(file);

      // Delete old profile picture if exists
      if (user.profilePicture) {
        await this.cloudinaryService.deleteImage(user.profilePicture);
      }
    }

    user.updateProfile(firstName, lastName, newProfilePicture, phone, address);
    await this.userRepository.save(user);
  }
}
