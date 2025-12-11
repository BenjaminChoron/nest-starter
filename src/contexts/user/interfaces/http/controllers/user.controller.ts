import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/contexts/auth/interfaces/http/guards/jwt-auth.guard';
import { CustomThrottlerGuard } from '../../../../shared/infrastructure/guards/throttler.guard';
import { AdminGuard } from '../../../../shared/infrastructure/guards/admin.guard';
import { SuperAdminGuard } from '../../../../shared/infrastructure/guards/super-admin.guard';
import { CreateUserCommand } from '../../../application/commands/create-user.command';
import { UpdateUserProfileCommand } from '../../../application/commands/update-user-profile.command';
import { GetUserByIdQuery } from '../../../application/queries/get-user-by-id.query';
import { GetAllUsersQuery } from '../../../application/queries/get-all-users.query';
import { User } from '../../../domain/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserRoleDto } from '../dtos/update-user-role.dto';
import { CloudinaryService } from '../../../../shared/infrastructure/services/cloudinary.service';
import { UpdateUserRoleCommand } from '../../../../auth/application/commands/update-user-role.command';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cloudinaryService: CloudinaryService,
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

  @UseGuards(CustomThrottlerGuard, JwtAuthGuard)
  @Put(':id/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload user profile picture',
    description: 'Uploads and updates the profile picture for a specific user.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (jpg, jpeg, png, gif)',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    required: true,
    type: 'string',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Profile picture updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async uploadProfilePicture(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<void> {
    // Get current user to check if they have a profile picture to delete
    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute<GetUserByIdQuery, User>(query);

    // Update user profile with new picture
    const command = new UpdateUserProfileCommand(
      id,
      user.firstName,
      user.lastName,
      undefined,
      user.phone,
      user.address,
      file,
    );
    await this.commandBus.execute(command);
  }

  @UseGuards(CustomThrottlerGuard, JwtAuthGuard, SuperAdminGuard)
  @Patch(':id/role')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user role',
    description: 'SuperAdmin can update user roles. Only "admin" and "user" roles can be assigned.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    required: true,
    type: 'string',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOkResponse({
    description: 'User role updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User role updated successfully',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired JWT token or insufficient permissions (SuperAdmin required)',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - invalid roles or attempting to modify superAdmin role',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto): Promise<{ message: string }> {
    await this.commandBus.execute(new UpdateUserRoleCommand(id, dto.roles));
    return { message: 'User role updated successfully' };
  }
}
