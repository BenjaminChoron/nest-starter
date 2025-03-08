/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserEntity } from './user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    return userEntity ? userEntity.toDomain() : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email: email.toString() },
    });
    return userEntity ? userEntity.toDomain() : null;
  }

  async save(user: User): Promise<void> {
    const userEntity = UserEntity.fromDomain(user);
    await this.userRepository.save(userEntity);
  }
}
