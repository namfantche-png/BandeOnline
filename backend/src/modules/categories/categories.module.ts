import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de categorias
 * Gerencia categorias de anúncios
 */
@Module({
  providers: [CategoriesService, DatabaseService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
