import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('SENDGRID_API_KEY');
    SendGrid.setApiKey(apiKey);
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.configService.getOrThrow<string>('APP_URL')}/auth/verify?token=${verificationToken}`;

    const msg = {
      to: email,
      from: this.configService.getOrThrow<string>('SENDGRID_FROM_EMAIL'),
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      await SendGrid.send(msg);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
