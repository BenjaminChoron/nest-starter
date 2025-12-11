import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: ['admin'],
    description: 'Array of user roles',
    type: [String],
    enum: ['admin', 'user'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be provided' })
  @IsEnum(['admin', 'user'], { each: true, message: 'Each role must be either "admin" or "user"' })
  roles: ('admin' | 'user')[];
}
