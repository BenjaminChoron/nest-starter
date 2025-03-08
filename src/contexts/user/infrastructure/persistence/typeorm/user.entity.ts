import { Entity, Column, PrimaryColumn } from 'typeorm';
import { User as DomainUser } from '../../../domain/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Phone } from '../../../domain/value-objects/phone.value-object';
import { Address } from '../../../domain/value-objects/address.value-object';

@Entity('user_profiles')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  static fromDomain(domainUser: DomainUser): UserEntity {
    const entity = new UserEntity();
    entity.id = domainUser.id;
    entity.email = domainUser.email;
    entity.firstName = domainUser.firstName;
    entity.lastName = domainUser.lastName;
    entity.profilePicture = domainUser.profilePicture;
    entity.phone = domainUser.phone;
    entity.address = domainUser.address;
    return entity;
  }

  toDomain(): DomainUser {
    return new DomainUser(
      this.id,
      Email.create(this.email),
      this.firstName,
      this.lastName,
      this.profilePicture,
      this.phone ? Phone.create(this.phone) : undefined,
      this.address ? Address.create(this.address) : undefined,
    );
  }
}
