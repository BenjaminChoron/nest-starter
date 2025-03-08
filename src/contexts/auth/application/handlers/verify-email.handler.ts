import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { VerifyEmailCommand } from '../commands/verify-email.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<void> {
    const { token } = command;

    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    user.verify();
    await this.userRepository.save(user);
  }
}
