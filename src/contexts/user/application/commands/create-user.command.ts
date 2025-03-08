import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';
import { Address } from '../../domain/value-objects/address.value-object';

export class CreateUserCommand {
  constructor(
    public readonly id: string,
    email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly profilePicture?: string,
    phone?: string,
    address?: string,
  ) {
    this.email = Email.create(email);
    this.phone = phone ? Phone.create(phone) : undefined;
    this.address = address ? Address.create(address) : undefined;
  }

  public readonly email: Email;
  public readonly phone?: Phone;
  public readonly address?: Address;
}
