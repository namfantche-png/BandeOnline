import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { NotificationsController } from './notifications.controller';

/**
 * Módulo de notificações
 * Gerencia notificações do sistema e envio de emails
 */
@Module({
  providers: [NotificationsService, EmailService],
  controllers: [NotificationsController],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
