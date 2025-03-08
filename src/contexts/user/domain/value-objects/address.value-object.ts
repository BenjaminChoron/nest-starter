import { InvalidAddressException } from '../exceptions/invalid-address.exception';

export class Address {
  private constructor(private readonly value: string) {
    this.ensureValidAddress(value);
  }

  private ensureValidAddress(address: string): void {
    if (!address || address.trim().length < 5) {
      throw new InvalidAddressException(address);
    }
  }

  static create(value: string): Address {
    return new Address(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Address): boolean {
    return this.value === other.value;
  }
}
