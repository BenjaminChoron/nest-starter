import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../commands/register-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { UserAlreadyExistsException } from 'src/common/exceptions/user-already-exists.exception';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, password } = command;
    const emailVO = new Email(email);

    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    const userId = randomUUID();
    const passwordVO = await Password.create(password);
    const user = new User(userId, emailVO, passwordVO);

    // Generate verification token
    const verificationToken = randomUUID();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // Token expires in 24 hours
    user.setVerificationToken(verificationToken, tokenExpiresAt);

    await this.userRepository.save(user);

    const event = new UserRegisteredEvent(userId, email, verificationToken);
    this.eventBus.publish(event);
  }
}
