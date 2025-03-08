import { AggregateRoot } from '@nestjs/cqrs';
import { UserCreatedEvent } from './events/user-created.event';
import { UserUpdatedEvent } from './events/user-updated.event';
import { Email } from './value-objects/email.value-object';
import { Phone } from './value-objects/phone.value-object';
import { Address } from './value-objects/address.value-object';

export class User extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private _email: Email,
    private _firstName: string,
    private _lastName: string,
    private _profilePicture?: string,
    private _phone?: Phone,
    private _address?: Address,
  ) {
    super();
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email.toString();
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get profilePicture(): string | undefined {
    return this._profilePicture;
  }

  get phone(): string | undefined {
    return this._phone?.toString();
  }

  get address(): string | undefined {
    return this._address?.toString();
  }

  updateProfile(firstName: string, lastName: string, profilePicture?: string, phone?: string, address?: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._profilePicture = profilePicture;
    this._phone = phone ? Phone.create(phone) : undefined;
    this._address = address ? Address.create(address) : undefined;

    this.apply(new UserUpdatedEvent(this.id, firstName, lastName, profilePicture, phone, address));
  }

  static create(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    profilePicture?: string,
    phone?: string,
    address?: string,
  ): User {
    const user = new User(
      id,
      Email.create(email),
      firstName,
      lastName,
      profilePicture,
      phone ? Phone.create(phone) : undefined,
      address ? Address.create(address) : undefined,
    );

    user.apply(new UserCreatedEvent(id, email, firstName, lastName, profilePicture, phone, address));

    return user;
  }
}
