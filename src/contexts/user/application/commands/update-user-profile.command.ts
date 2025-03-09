import { Phone } from '../../domain/value-objects/phone.value-object';
import { Address } from '../../domain/value-objects/address.value-object';

export class UpdateUserProfileCommand {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly profilePicture?: string,
    phone?: string,
    address?: string,
    public readonly file?: Express.Multer.File,
  ) {
    this.phone = phone ? Phone.create(phone) : undefined;
    this.address = address ? Address.create(address) : undefined;
  }

  public readonly phone?: Phone;
  public readonly address?: Address;
}
