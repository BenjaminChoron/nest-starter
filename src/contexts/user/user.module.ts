import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from './infrastructure/persistence/typeorm/user.entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/typeorm-user.repository';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { UpdateUserProfileHandler } from './application/commands/handlers/update-user-profile.handler';
import { GetUserByIdHandler } from './application/queries/handlers/get-user-by-id.handler';
import { USER_REPOSITORY } from './domain/user.repository';
import { UserController } from './presentation/user.controller';

const CommandHandlers = [CreateUserHandler, UpdateUserProfileHandler];
const QueryHandlers = [GetUserByIdHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UserController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
