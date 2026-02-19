import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { DatabaseService } from '../../config/database.config';

/**
 * Módulo de uploads
 * Gerencia upload de imagens com Cloudinary
 */
@Module({
  providers: [UploadsService, DatabaseService],
  controllers: [UploadsController],
  exports: [UploadsService],
})
export class UploadsModule {}
