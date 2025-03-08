/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { CreateUserCommand } from '../commands/create-user.command';

@Injectable()
export class UserRegistrationSaga {
  @Saga()
  userRegistered = (events$: Observable<UserRegisteredEvent>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserRegisteredEvent),
      map((event: UserRegisteredEvent) => {
        return new CreateUserCommand(
          event.id,
          event.email,
          '', // firstName will be empty initially
          '', // lastName will be empty initially
        );
      }),
    );
  };
}
