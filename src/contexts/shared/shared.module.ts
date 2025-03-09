import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './infrastructure/services/mail.service';
import { CustomThrottlerGuard } from './infrastructure/guards/throttler.guard';
import { CsrfController } from './infrastructure/controllers/csrf.controller';
import { CloudinaryService } from './infrastructure/services/cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [MailService, CustomThrottlerGuard, CloudinaryService],
  exports: [MailService, CustomThrottlerGuard, CloudinaryService],
  controllers: [CsrfController],
})
export class SharedModule {}
