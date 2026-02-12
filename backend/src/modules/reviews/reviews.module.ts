import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de avaliações
 * Gerencia avaliações de vendedores
 */
@Module({
  providers: [ReviewsService, DatabaseService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
