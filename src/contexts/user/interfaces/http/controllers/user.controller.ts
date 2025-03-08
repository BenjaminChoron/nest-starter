import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/contexts/auth/interfaces/http/guards/jwt-auth.guard';
import { CreateUserCommand } from '../../../application/commands/create-user.command';
import { UpdateUserProfileCommand } from '../../../application/commands/update-user-profile.command';
import { GetUserByIdQuery } from '../../../application/queries/get-user-by-id.query';
import { User } from '../../../domain/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'User created successfully' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    const { id, email, firstName, lastName, profilePicture, phone, address } = createUserDto;
    const command = new CreateUserCommand(id, email, firstName, lastName, profilePicture, phone, address);
    await this.commandBus.execute(command);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User profile updated successfully' })
  async updateUserProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserProfileDto): Promise<void> {
    const { firstName, lastName, profilePicture, phone, address } = updateUserDto;
    const command = new UpdateUserProfileCommand(id, firstName, lastName, profilePicture, phone, address);
    await this.commandBus.execute(command);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDto, description: 'User found successfully' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute<GetUserByIdQuery, User>(query);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      phone: user.phone,
      address: user.address,
    };
  }
}
