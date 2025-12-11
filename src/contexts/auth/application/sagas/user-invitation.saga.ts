/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { UserInvitedEvent } from '../../domain/events/user-invited.event';
import { MailService } from '../../../shared/infrastructure/services/mail.service';

@Injectable()
export class UserInvitationSaga {
  constructor(private readonly mailService: MailService) {}

  @Saga()
  sendProfileCreationEmail = (events$: Observable<UserInvitedEvent>): Observable<ICommand | undefined> => {
    return events$.pipe(
      ofType(UserInvitedEvent),
      mergeMap((event: UserInvitedEvent) =>
        from(this.mailService.sendProfileCreationEmail(event.email, event.profileCreationToken)).pipe(
          map(() => undefined),
        ),
      ),
    );
  };
}
