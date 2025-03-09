import { InvalidEmailException } from '../../../../common/exceptions/invalid-email.exception';

export class Email {
  private constructor(private readonly value: string) {
    this.ensureValidEmail(value);
  }

  private ensureValidEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailException(email);
    }
  }

  static create(value: string): Email {
    return new Email(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
