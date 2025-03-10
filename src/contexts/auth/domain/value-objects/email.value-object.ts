import { InvalidEmailException } from '../../../../contexts/shared/application/exceptions/invalid-email.exception';

export class Email {
  private readonly value: string;
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase();
  }

  private validate(email: string): void {
    if (!email || !Email.EMAIL_REGEX.test(email)) {
      throw new InvalidEmailException(email);
    }
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
