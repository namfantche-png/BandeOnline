import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { DatabaseService } from '../../config/database.config';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UploadsModule } from '../uploads/uploads.module';

/**
 * Módulo de anúncios
 * Gerencia criação, edição, listagem e exclusão de anúncios
 */
@Module({
  imports: [UploadsModule],
  providers: [AdsService, DatabaseService, PlansService, SubscriptionsService],
  controllers: [AdsController],
  exports: [AdsService],
})
export class AdsModule {}
