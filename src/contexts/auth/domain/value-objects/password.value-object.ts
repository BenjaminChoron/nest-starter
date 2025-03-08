import * as bcrypt from 'bcrypt';
import { InvalidPasswordException } from '../../../../common/exceptions/invalid-password.exception';

export class Password {
  private readonly value: string;
  private static readonly SALT_ROUNDS = 10;
  private static readonly MIN_LENGTH = 8;
  private static readonly INVALID_LENGTH_MESSAGE = 'Password must be at least 8 characters long';

  private constructor(password: string) {
    this.value = password;
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword || plainPassword.length < Password.MIN_LENGTH) {
      throw new InvalidPasswordException(Password.INVALID_LENGTH_MESSAGE);
    }
    const hashedPassword = await Password.hash(plainPassword);
    return new Password(hashedPassword);
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
