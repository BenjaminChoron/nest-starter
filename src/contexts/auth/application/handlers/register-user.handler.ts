import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../commands/register-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { UserAlreadyExistsException } from 'src/common/exceptions/user-already-exists.exception';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, password } = command;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    const userId = randomUUID();
    const user = new User(userId, email, '');
    await user.setPassword(password);

    await this.userRepository.save(user);

    const event = new UserRegisteredEvent(userId, email);
    this.eventBus.publish(event);
  }
}
