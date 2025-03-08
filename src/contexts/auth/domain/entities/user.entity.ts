import { AggregateRoot } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

export class User extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private readonly _email: string,
    private _password: string,
    private readonly _roles: string[] = ['user'],
  ) {
    super();
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get roles(): string[] {
    return [...this._roles];
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this._password);
  }

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    this._password = await bcrypt.hash(password, salt);
  }

  toJSON() {
    return {
      id: this._id,
      email: this._email,
      roles: this._roles,
    };
  }
}
