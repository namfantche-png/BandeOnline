import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de pagamentos
 * Gerencia pagamentos e transações
 */
@Module({
  providers: [PaymentsService, DatabaseService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
