import * as bcrypt from 'bcrypt';
import { InvalidPasswordException } from '../../../shared/application/exceptions/invalid-password.exception';

export class Password {
  private readonly value: string;
  private static readonly SALT_ROUNDS = 10;
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 64;
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  private static readonly VALIDATION_RULES = {
    MIN_LENGTH: 'Password must be at least 8 characters long',
    MAX_LENGTH: 'Password must not exceed 64 characters',
    COMPLEXITY:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  };

  private constructor(password: string) {
    this.value = password;
  }

  static async create(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);
    const hashedPassword = await Password.hash(plainPassword);
    return new Password(hashedPassword);
  }

  private static validate(password: string): void {
    if (!password || password.length < Password.MIN_LENGTH) {
      throw new InvalidPasswordException(Password.VALIDATION_RULES.MIN_LENGTH);
    }

    if (password.length > Password.MAX_LENGTH) {
      throw new InvalidPasswordException(Password.VALIDATION_RULES.MAX_LENGTH);
    }

    if (!Password.PASSWORD_REGEX.test(password)) {
      throw new InvalidPasswordException(Password.VALIDATION_RULES.COMPLEXITY);
    }
  }

  static createHashed(hashedPassword: string): Promise<Password> {
    return Promise.resolve(new Password(hashedPassword));
  }

  private static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(Password.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.value);
  }

  toString(): string {
    return this.value;
  }
}
