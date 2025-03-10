import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const { token, password } = command;

    const user = await this.userRepository.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid password reset token');
    }

    if (!user.isPasswordResetTokenValid()) {
      throw new BadRequestException('Password reset token has expired');
    }

    await user.setPassword(password);
    user.clearPasswordResetToken();
    await this.userRepository.save(user);
  }
}
