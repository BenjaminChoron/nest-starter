import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'URL to user profile picture' })
  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.+/, { message: 'Profile picture must be a valid URL' })
  profilePicture?: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[\d\s-]{8,}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ description: 'User address' })
  @IsString()
  @IsOptional()
  address?: string;
}
