import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutUserCommand } from '../commands/logout-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@CommandHandler(LogoutUserCommand)
export class LogoutUserHandler implements ICommandHandler<LogoutUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: LogoutUserCommand): Promise<void> {
    const { userId } = command;
    const user = await this.userRepository.findById(userId);

    if (user) {
      user.clearRefreshToken();
      await this.userRepository.save(user);
    }
  }
}
