import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { UserEntity } from './user.entity';
import { User } from '../../../domain/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let typeormRepository: jest.Mocked<Repository<UserEntity>>;

  const mockEmail = Email.create('test@example.com');
  const mockUser = new User('test-id', mockEmail, 'John', 'lastName');

  const mockUserEntity = {
    id: 'test-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    toDomain: jest.fn().mockReturnValue(mockUser),
  } as unknown as UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
    typeormRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const findOne = jest.spyOn(typeormRepository, 'findOne').mockResolvedValue(mockUserEntity);

      const result = await repository.findById('test-id');

      expect(findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const findOne = jest.spyOn(typeormRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const findOne = jest.spyOn(typeormRepository, 'findOne').mockResolvedValue(mockUserEntity);
      const emailVO = Email.create('test@example.com');

      const result = await repository.findByEmail(emailVO);

      expect(findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      const findOne = jest.spyOn(typeormRepository, 'findOne').mockResolvedValue(null);
      const emailVO = Email.create('non-existent@example.com');

      const result = await repository.findByEmail(emailVO);

      expect(findOne).toHaveBeenCalledWith({ where: { email: 'non-existent@example.com' } });
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a user entity', async () => {
      const save = jest.spyOn(typeormRepository, 'save');
      jest.spyOn(UserEntity, 'fromDomain').mockReturnValue(mockUserEntity);

      await repository.save(mockUser);

      expect(save).toHaveBeenCalledWith(mockUserEntity);
    });
  });

  describe('update', () => {
    it('should update a user entity', async () => {
      const update = jest.spyOn(typeormRepository, 'update');
      jest.spyOn(UserEntity, 'fromDomain').mockReturnValue(mockUserEntity);

      await repository.update(mockUser);

      expect(update).toHaveBeenCalledWith({ id: mockUser.id }, mockUserEntity);
    });
  });
});
