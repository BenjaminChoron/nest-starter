import { InvalidEmailException } from 'src/contexts/shared/application/exceptions/invalid-email.exception';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validate(email);
    this.value = email;
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new InvalidEmailException(email);
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
