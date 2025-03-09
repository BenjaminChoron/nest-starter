import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/contexts/auth/interfaces/http/guards/jwt-auth.guard';
import { CustomThrottlerGuard } from '../../../../shared/infrastructure/guards/throttler.guard';
import { AdminGuard } from '../../../../shared/infrastructure/guards/admin.guard';
import { CreateUserCommand } from '../../../application/commands/create-user.command';
import { UpdateUserProfileCommand } from '../../../application/commands/update-user-profile.command';
import { GetUserByIdQuery } from '../../../application/queries/get-user-by-id.query';
import { GetAllUsersQuery } from '../../../application/queries/get-all-users.query';
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

  @UseGuards(CustomThrottlerGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user with the provided profile information. This endpoint is typically used by administrators.',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'User created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - missing required fields or invalid format',
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    const { id, email, firstName, lastName, profilePicture, phone, address } = createUserDto;
    const command = new CreateUserCommand(id, email, firstName, lastName, profilePicture, phone, address);
    await this.commandBus.execute(command);
  }

  @UseGuards(CustomThrottlerGuard, JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Updates the profile information of an existing user. Users can only update their own profile unless they have admin privileges.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    required: true,
    type: 'string',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User profile updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - missing required fields or invalid format',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async updateUserProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserProfileDto): Promise<void> {
    const { firstName, lastName, profilePicture, phone, address } = updateUserDto;
    const command = new UpdateUserProfileCommand(id, firstName, lastName, profilePicture, phone, address);
    await this.commandBus.execute(command);
  }

  @UseGuards(CustomThrottlerGuard, JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed profile information for a specific user by their ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    required: true,
    type: 'string',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
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

  @UseGuards(CustomThrottlerGuard, JwtAuthGuard, AdminGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users. This endpoint is only accessible to administrators.',
  })
  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'List of users retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token or insufficient permissions',
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    const query = new GetAllUsersQuery();
    const users = await this.queryBus.execute<GetAllUsersQuery, User[]>(query);

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      phone: user.phone,
      address: user.address,
    }));
  }
}
