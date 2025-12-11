import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CompleteProfileCommand } from '../commands/complete-profile.command';
import {
  IUserRepository as IAuthUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import {
  IUserRepository as IUserProfileRepository,
  USER_REPOSITORY as USER_PROFILE_REPOSITORY,
} from '../../../user/domain/user.repository';
import { User as UserProfile } from '../../../user/domain/user.entity';
import { Email } from '../../../user/domain/value-objects/email.value-object';
import { Phone } from '../../../user/domain/value-objects/phone.value-object';
import { Address } from '../../../user/domain/value-objects/address.value-object';

@CommandHandler(CompleteProfileCommand)
export class CompleteProfileHandler implements ICommandHandler<CompleteProfileCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly authUserRepository: IAuthUserRepository,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(command: CompleteProfileCommand): Promise<void> {
    const { token, password, firstName, lastName, profilePicture, phone, address } = command;

    // Find auth user by profile creation token
    const authUser = await this.authUserRepository.findByProfileCreationToken(token);
    if (!authUser) {
      throw new NotFoundException('Invalid or expired profile creation token');
    }

    // Validate token
    if (!authUser.isProfileCreationTokenValid()) {
      throw new BadRequestException('Profile creation token has expired');
    }

    // Set password
    await authUser.setPassword(password);

    // Verify email
    authUser.verify();

    // Clear profile creation token
    authUser.clearProfileCreationToken();

    // Save auth user
    await this.authUserRepository.save(authUser);

    // Create user profile
    const emailVO = Email.create(authUser.email);
    const phoneVO = phone ? Phone.create(phone) : undefined;
    const addressVO = address ? Address.create(address) : undefined;

    const userProfile = UserProfile.create(
      authUser.id,
      emailVO,
      firstName,
      lastName,
      profilePicture,
      phoneVO,
      addressVO,
    );

    await this.userProfileRepository.save(userProfile);
  }
}
