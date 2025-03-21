import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/user.repository';
import { User } from '../../../domain/user.entity';
import { UserAlreadyExistsException } from '../../../../shared/application/exceptions/user-already-exists.exception';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const { id, email, firstName, lastName, profilePicture, phone, address } = command;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email.toString());
    }

    const user = User.create(id, email, firstName, lastName, profilePicture, phone, address);
    await this.userRepository.save(user);
  }
}
