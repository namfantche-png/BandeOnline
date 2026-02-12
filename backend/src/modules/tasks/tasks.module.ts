import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Módulo de tarefas agendadas
 * Gerencia jobs periódicos (cron jobs)
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    NotificationsModule,
    PaymentsModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
