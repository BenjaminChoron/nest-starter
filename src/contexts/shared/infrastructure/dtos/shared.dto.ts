import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsObject, IsEnum } from 'class-validator';

enum TemplateType {
  VERIFICATION = 'email-verification-template',
  PASSWORD_RESET = 'password-reset-template',
}

interface EmailContext {
  [key: string]: string;
}

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  to: string;

  @ApiProperty({ example: 'Welcome to Our Service' })
  @IsString({ message: 'Subject must be a string' })
  subject: string;

  @ApiProperty({ example: 'email-verification-template', enumName: 'TemplateType', enum: TemplateType })
  @IsEnum(TemplateType, { message: `Template must be one of the following: ${Object.values(TemplateType).join(', ')}` })
  template: TemplateType;

  @ApiProperty({
    example: {
      verificationLink: 'https://example.com/verify?token=abc123',
      resetLink: 'https://example.com/reset?token=def456',
    },
    description: 'Context data for the email template',
  })
  @IsObject({ message: 'Context must be an object' })
  context: EmailContext;
}
