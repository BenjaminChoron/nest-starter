import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { UserEntity } from './infrastructure/persistence/typeorm/user.entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/typeorm-user.repository';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { UpdateUserProfileHandler } from './application/commands/handlers/update-user-profile.handler';
import { GetUserByIdHandler } from './application/queries/handlers/get-user-by-id.handler';
import { GetAllUsersHandler } from './application/queries/handlers/get-all-users.handler';
import { USER_REPOSITORY } from './domain/user.repository';
import { UserController } from './interfaces/http/controllers/user.controller';
import { UserRegistrationSaga } from './application/sagas/user-registration.saga';
import { PasswordResetRequestedHandler } from '../auth/application/events-handlers/password-reset-requested.handler';

const CommandHandlers = [CreateUserHandler, UpdateUserProfileHandler];
const QueryHandlers = [GetUserByIdHandler, GetAllUsersHandler];
const Sagas = [UserRegistrationSaga];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
    SharedModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [UserController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Sagas,
    PasswordResetRequestedHandler,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
