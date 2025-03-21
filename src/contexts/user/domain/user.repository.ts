import { User } from './user.entity';
import { Email } from './value-objects/email.value-object';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}
