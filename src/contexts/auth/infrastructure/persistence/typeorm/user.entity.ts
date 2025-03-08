import { Entity, Column, PrimaryColumn } from 'typeorm';
import { User as DomainUser } from '../../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('simple-array')
  roles: string[];

  static fromDomain(domainUser: DomainUser): UserEntity {
    const entity = new UserEntity();
    entity.id = domainUser.id;
    entity.email = domainUser.email;
    entity.password = domainUser['_password'];
    entity.roles = domainUser.roles;
    return entity;
  }

  toDomain(): DomainUser {
    return new DomainUser(this.id, this.email, this.password, this.roles);
  }

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password, salt);
  }
}
