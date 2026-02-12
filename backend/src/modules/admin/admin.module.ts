import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseService } from '../../config/database.config';
import { AdminGuard } from '../../guards/admin.guard';

/**
 * Módulo de administração
 * Gerencia todas as funcionalidades do painel administrativo
 */
@Module({
  providers: [AdminService, DatabaseService, AdminGuard],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
