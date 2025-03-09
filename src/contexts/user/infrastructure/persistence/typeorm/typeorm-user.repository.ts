/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/user.repository';
import { User } from '../../../domain/user.entity';
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
    if (!userEntity) {
      return null;
    }
    return userEntity.toDomain();
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email: email.toString() },
    });
    if (!userEntity) {
      return null;
    }
    return userEntity.toDomain();
  }

  async save(user: User): Promise<void> {
    const userEntity = UserEntity.fromDomain(user);
    await this.userRepository.save(userEntity);
  }

  async update(user: User): Promise<void> {
    const userEntity = UserEntity.fromDomain(user);
    await this.userRepository.update({ id: user.id }, userEntity);
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    return Promise.all(userEntities.map((entity) => entity.toDomain()));
  }
}
