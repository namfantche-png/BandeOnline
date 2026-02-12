import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de denúncias
 * Gerencia denúncias de usuários e anúncios
 */
@Module({
  providers: [ReportsService, DatabaseService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
