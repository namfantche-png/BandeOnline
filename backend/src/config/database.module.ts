import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.config';

/**
 * Módulo global de banco de dados
 * Fornece DatabaseService a todos os módulos da aplicação
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
