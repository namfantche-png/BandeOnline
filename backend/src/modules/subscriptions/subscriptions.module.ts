import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de subscrições
 * Gerencia subscrições, upgrades e renovações de planos
 */
@Module({
  providers: [SubscriptionsService, DatabaseService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
