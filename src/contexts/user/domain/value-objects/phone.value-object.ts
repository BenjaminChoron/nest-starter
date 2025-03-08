import { InvalidPhoneException } from '../exceptions/invalid-phone.exception';

export class Phone {
  private constructor(private readonly value: string) {
    this.ensureValidPhone(value);
  }

  private ensureValidPhone(phone: string): void {
    // Basic phone number validation (can be enhanced based on requirements)
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phone)) {
      throw new InvalidPhoneException(phone);
    }
  }

  static create(value: string): Phone {
    return new Phone(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
