/* eslint-disable @darraghor/nestjs-typed/injectable-should-be-provided */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../domain/user.repository';
import { User } from '../../../domain/user.entity';
import { UserEntity } from './user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    return userEntity ? userEntity.toDomain() : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { email } });
    return userEntity ? userEntity.toDomain() : null;
  }

  async save(user: User): Promise<void> {
    const userEntity = UserEntity.fromDomain(user);
    await this.userRepository.save(userEntity);
  }

  async update(user: User): Promise<void> {
    const userEntity = UserEntity.fromDomain(user);
    await this.userRepository.update({ id: user.id }, userEntity);
  }
}
