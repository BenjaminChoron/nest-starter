import { Entity, Column, PrimaryColumn } from 'typeorm';
import { User as DomainUser } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Password } from '../../../domain/value-objects/password.value-object';

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
    entity.email = domainUser['_email'].toString();
    entity.password = domainUser['_password'].toString();
    entity.roles = domainUser.roles;
    return entity;
  }

  async toDomain(): Promise<DomainUser> {
    const email = new Email(this.email);
    const password = await Password.createHashed(this.password);
    return new DomainUser(this.id, email, password, this.roles);
  }
}
