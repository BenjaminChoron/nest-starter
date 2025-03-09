import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './infrastructure/services/mail.service';
import { CustomThrottlerGuard } from './infrastructure/guards/throttler.guard';

@Module({
  imports: [ConfigModule],
  providers: [MailService, CustomThrottlerGuard],
  exports: [MailService, CustomThrottlerGuard],
})
export class SharedModule {}
