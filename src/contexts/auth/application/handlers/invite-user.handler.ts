import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InviteUserCommand } from '../commands/invite-user.command';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserInvitedEvent } from '../../domain/events/user-invited.event';
import { UserAlreadyExistsException } from 'src/contexts/shared/application/exceptions/user-already-exists.exception';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { UnauthorizedException } from '@nestjs/common';

@CommandHandler(InviteUserCommand)
export class InviteUserHandler implements ICommandHandler<InviteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: InviteUserCommand): Promise<void> {
    const { email, role } = command;
    const emailVO = new Email(email);

    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    // Validate role
    if (role !== 'admin' && role !== 'user') {
      throw new UnauthorizedException('Invalid role. Role must be either "admin" or "user"');
    }

    const userId = randomUUID();
    // Create a temporary password - user will set their own password when completing profile
    // Generate a password that meets complexity requirements: uppercase, lowercase, number, special char
    const tempPassword = this.generateTemporaryPassword();
    const passwordVO = await Password.create(tempPassword);
    const user = new User(userId, emailVO, passwordVO, [role]);

    // Generate profile creation token
    const profileCreationToken = randomUUID();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // Token expires in 7 days
    user.setProfileCreationToken(profileCreationToken, tokenExpiresAt);

    await this.userRepository.save(user);

    const event = new UserInvitedEvent(userId, email, role, profileCreationToken);
    this.eventBus.publish(event);
  }

  /**
   * Generates a temporary password that meets complexity requirements:
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character from [@$!%*?&]
   */
  private generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&';
    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one of each required character type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest with random characters to meet minimum length (8 chars)
    const remainingLength = 8 - password.length;
    for (let i = 0; i < remainingLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize character positions
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
