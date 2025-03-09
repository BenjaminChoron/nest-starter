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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
}
