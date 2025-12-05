import { Controller, Post, Logger, Body, HttpCode } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from '../dtos/shared.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(private readonly mailService: MailService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send an email',
    description: 'Sends an email using the specified parameters.',
  })
  @ApiOkResponse({
    description: 'Email sent successfully.',
    schema: {
      example: {
        status: 'success',
        message: 'Email sent successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Wrong template parameters provided.',
    schema: {
      example: {
        statusCode: 400,
        message: ['Template must be one of the following: email-verification-template, password-reset-template'],
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({ type: SendEmailDto })
  async sendMail(@Body() emailInformations: SendEmailDto) {
    this.logger.log(
      `Sending email to ${emailInformations.to} with subject "${emailInformations.subject}" using template "${emailInformations.template}"`,
    );

    try {
      await this.mailService.sendEmail({
        to: emailInformations.to,
        subject: emailInformations.subject,
        template: emailInformations.template,
        context: emailInformations.context,
      });

      return {
        status: 'success',
        message: 'Email sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send test email to ${emailInformations.to}`, error);
      throw error;
    }
  }
}
