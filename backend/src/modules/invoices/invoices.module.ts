import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de faturas
 * Gerencia geração e consulta de faturas/recibos
 */
@Module({
  providers: [InvoicesService, DatabaseService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
