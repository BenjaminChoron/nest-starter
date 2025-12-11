import { AggregateRoot } from '@nestjs/cqrs';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';

export class User extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private _password: Password,
    private _roles: string[] = ['user'],
    private _isEmailVerified: boolean = false,
    private _verificationToken: string | null = null,
    private _verificationTokenExpiresAt: Date | null = null,
    private _refreshToken: string | null = null,
    private _refreshTokenExpiresAt: Date | null = null,
    private _passwordResetToken: string | null = null,
    private _passwordResetTokenExpiresAt: Date | null = null,
    private _profileCreationToken: string | null = null,
    private _profileCreationTokenExpiresAt: Date | null = null,
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

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  get refreshTokenExpiresAt(): Date | null {
    return this._refreshTokenExpiresAt;
  }

  get passwordResetToken(): string | null {
    return this._passwordResetToken;
  }

  get passwordResetTokenExpiresAt(): Date | null {
    return this._passwordResetTokenExpiresAt;
  }

  get profileCreationToken(): string | null {
    return this._profileCreationToken;
  }

  get profileCreationTokenExpiresAt(): Date | null {
    return this._profileCreationTokenExpiresAt;
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

  setRefreshToken(token: string, expiresAt: Date): void {
    this._refreshToken = token;
    this._refreshTokenExpiresAt = expiresAt;
  }

  clearRefreshToken(): void {
    this._refreshToken = null;
    this._refreshTokenExpiresAt = null;
  }

  isRefreshTokenValid(): boolean {
    if (!this._refreshToken || !this._refreshTokenExpiresAt) {
      return false;
    }
    return new Date() < this._refreshTokenExpiresAt;
  }

  setPasswordResetToken(token: string, expiresAt: Date): void {
    this._passwordResetToken = token;
    this._passwordResetTokenExpiresAt = expiresAt;
  }

  clearPasswordResetToken(): void {
    this._passwordResetToken = null;
    this._passwordResetTokenExpiresAt = null;
  }

  isPasswordResetTokenValid(): boolean {
    if (!this._passwordResetToken || !this._passwordResetTokenExpiresAt) {
      return false;
    }
    return this._passwordResetTokenExpiresAt > new Date();
  }

  setProfileCreationToken(token: string, expiresAt: Date): void {
    this._profileCreationToken = token;
    this._profileCreationTokenExpiresAt = expiresAt;
  }

  clearProfileCreationToken(): void {
    this._profileCreationToken = null;
    this._profileCreationTokenExpiresAt = null;
  }

  isProfileCreationTokenValid(): boolean {
    if (!this._profileCreationToken || !this._profileCreationTokenExpiresAt) {
      return false;
    }
    return this._profileCreationTokenExpiresAt > new Date();
  }

  updateRoles(roles: string[]): void {
    this._roles = [...roles];
  }

  toJSON() {
    return {
      id: this._id,
      email: this._email.toString(),
      roles: this._roles,
      isEmailVerified: this._isEmailVerified,
      refreshToken: this._refreshToken,
      refreshTokenExpiresAt: this._refreshTokenExpiresAt,
    };
  }
}
