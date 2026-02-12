import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de planos
 * Gerencia planos de subscrição
 */
@Module({
  providers: [PlansService, DatabaseService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule {}
