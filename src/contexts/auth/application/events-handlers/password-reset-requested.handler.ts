import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PasswordResetRequestedEvent } from '../../domain/events/password-reset-requested.event';
import { MailService } from '../../../shared/infrastructure/services/mail.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@EventsHandler(PasswordResetRequestedEvent)
export class PasswordResetRequestedHandler implements IEventHandler<PasswordResetRequestedEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(event: PasswordResetRequestedEvent) {
    const { email, resetToken } = event;

    await this.mailService.sendPasswordResetEmail(email, resetToken);
  }
}
