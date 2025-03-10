import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RequestPasswordResetCommand } from '../commands/request-password-reset.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { Email } from '../../domain/value-objects/email.value-object';
import { PasswordResetRequestedEvent } from '../../domain/events/password-reset-requested.event';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const { email } = command;
    const emailVO = new Email(email);

    const user = await this.userRepository.findByEmail(emailVO);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate password reset token
    const resetToken = randomUUID();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1); // Token expires in 1 hour
    user.setPasswordResetToken(resetToken, tokenExpiresAt);

    await this.userRepository.save(user);

    // Publish event for sending password reset email
    const event = new PasswordResetRequestedEvent(user.id, user.email, resetToken);
    this.eventBus.publish(event);
  }
}
