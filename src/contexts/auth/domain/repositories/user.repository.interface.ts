import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.value-object';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  findByVerificationToken(token: string): Promise<User | null>;
  findByRefreshToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  count(): Promise<number>;
}
