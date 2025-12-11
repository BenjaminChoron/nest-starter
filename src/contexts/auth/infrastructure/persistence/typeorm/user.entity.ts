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

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  verificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  verificationTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  refreshToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  refreshTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  profileCreationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  profileCreationTokenExpiresAt: Date | null;

  static fromDomain(domainUser: DomainUser): UserEntity {
    const entity = new UserEntity();
    entity.id = domainUser.id;
    entity.email = domainUser['_email'].toString();
    entity.password = domainUser['_password'].toString();
    entity.roles = domainUser.roles;
    entity.isEmailVerified = domainUser['_isEmailVerified'];
    entity.verificationToken = domainUser['_verificationToken'];
    entity.verificationTokenExpiresAt = domainUser['_verificationTokenExpiresAt'];
    entity.refreshToken = domainUser['_refreshToken'];
    entity.refreshTokenExpiresAt = domainUser['_refreshTokenExpiresAt'];
    entity.passwordResetToken = domainUser['_passwordResetToken'];
    entity.passwordResetTokenExpiresAt = domainUser['_passwordResetTokenExpiresAt'];
    entity.profileCreationToken = domainUser['_profileCreationToken'];
    entity.profileCreationTokenExpiresAt = domainUser['_profileCreationTokenExpiresAt'];
    return entity;
  }

  async toDomain(): Promise<DomainUser> {
    const email = new Email(this.email);
    const password = await Password.createHashed(this.password);
    return new DomainUser(
      this.id,
      email,
      password,
      this.roles,
      this.isEmailVerified,
      this.verificationToken,
      this.verificationTokenExpiresAt,
      this.refreshToken,
      this.refreshTokenExpiresAt,
      this.passwordResetToken,
      this.passwordResetTokenExpiresAt,
      this.profileCreationToken,
      this.profileCreationTokenExpiresAt,
    );
  }
}
