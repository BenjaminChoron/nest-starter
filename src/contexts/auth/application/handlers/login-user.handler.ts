import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from '../commands/login-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InvalidCredentialsException } from '../../../../common/exceptions/invalid-credentials.exception';
import { Email } from '../../domain/value-objects/email.value-object';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<{ access_token: string }> {
    const { email, password } = command;
    const emailVO = new Email(email);

    const user = await this.userRepository.findByEmail(emailVO);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
