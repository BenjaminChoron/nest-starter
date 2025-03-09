import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './infrastructure/services/mail.service';
import { CustomThrottlerGuard } from './infrastructure/guards/throttler.guard';
import { CsrfController } from './infrastructure/controllers/csrf.controller';

@Module({
  imports: [ConfigModule],
  providers: [MailService, CustomThrottlerGuard],
  exports: [MailService, CustomThrottlerGuard],
  controllers: [CsrfController],
})
export class SharedModule {}
