import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de usuários
 * Gerencia perfis e dados de usuários
 */
@Module({
  providers: [UsersService, DatabaseService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
