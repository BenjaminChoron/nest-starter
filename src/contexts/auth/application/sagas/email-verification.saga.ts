/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { MailService } from '../../../shared/infrastructure/services/mail.service';

@Injectable()
export class EmailVerificationSaga {
  constructor(private readonly mailService: MailService) {}

  @Saga()
  sendVerificationEmail = (events$: Observable<UserRegisteredEvent>): Observable<ICommand | undefined> => {
    return events$.pipe(
      ofType(UserRegisteredEvent),
      mergeMap((event: UserRegisteredEvent) =>
        from(this.mailService.sendVerificationEmail(event.email, event.verificationToken)).pipe(map(() => undefined)),
      ),
    );
  };
}
