import { AggregateRoot } from '@nestjs/cqrs';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';

export class User extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private _password: Password,
    private readonly _roles: string[] = ['user'],
    private _isEmailVerified: boolean = false,
    private _verificationToken: string | null = null,
    private _verificationTokenExpiresAt: Date | null = null,
  ) {
    super();
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email.toString();
  }

  get roles(): string[] {
    return [...this._roles];
  }

  get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }

  get verificationToken(): string | null {
    return this._verificationToken;
  }

  get verificationTokenExpiresAt(): Date | null {
    return this._verificationTokenExpiresAt;
  }

  setVerificationToken(token: string, expiresAt: Date): void {
    this._verificationToken = token;
    this._verificationTokenExpiresAt = expiresAt;
  }

  verify(): void {
    this._isEmailVerified = true;
    this._verificationToken = null;
    this._verificationTokenExpiresAt = null;
  }

  async validatePassword(password: string): Promise<boolean> {
    return this._password.compare(password);
  }

  async setPassword(password: string): Promise<void> {
    this._password = await Password.create(password);
  }

  toJSON() {
    return {
      id: this._id,
      email: this._email.toString(),
      roles: this._roles,
      isEmailVerified: this._isEmailVerified,
    };
  }
}
