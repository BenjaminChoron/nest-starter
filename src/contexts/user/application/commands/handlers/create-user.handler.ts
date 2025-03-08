import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { UserRepository, USER_REPOSITORY } from '../../../domain/user.repository';
import { User } from '../../../domain/user.entity';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const { id, email, firstName, lastName, profilePicture, phone, address } = command;

    const existingUser = await this.userRepository.findByEmail(email.toString());
    if (existingUser) {
      throw new UserAlreadyExistsException(email.toString());
    }

    const user = User.create(id, email, firstName, lastName, profilePicture, phone, address);
    await this.userRepository.save(user);
  }
}
