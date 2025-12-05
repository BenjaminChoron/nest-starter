import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(params: { to: string; subject: string; template: string; context: ISendMailOptions['context'] }) {
    try {
      const sendMailParams = {
        to: params.to,
        from: process.env.SMTP_FROM,
        subject: params.subject,
        template: params.template,
        context: params.context,
      };
      const response: unknown = await this.mailerService.sendMail(sendMailParams);
      this.logger.log(
        `Email sent successfully to recipients with the following parameters : ${JSON.stringify(sendMailParams)}`,
        response,
      );
    } catch (error) {
      this.logger.error(`Error while sending mail with the following parameters : ${JSON.stringify(params)}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset-template',
      context: {
        resetLink,
      },
    });
  }

  async sendVerificationEmail(to: string, verificationToken: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await this.sendEmail({
      to,
      subject: 'Email Verification',
      template: 'email-verification-template',
      context: {
        verificationLink,
      },
    });
  }
}
