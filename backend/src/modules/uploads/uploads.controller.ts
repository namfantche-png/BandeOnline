import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { memoryStorage } from 'multer';

/**
 * Controlador de uploads
 * Endpoints: /uploads
 */
@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  /**
   * Upload de imagem única
   * POST /uploads/image
   */
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de imagem única' })
  async uploadImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadsService.uploadImage(file, user.userId, folder || 'ads');
  }

  /**
   * Upload de múltiplas imagens
   * POST /uploads/images
   */
  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por arquivo
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de múltiplas imagens' })
  async uploadMultipleImages(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
    @Body('maxImages') maxImages?: number,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadsService.uploadMultipleImages(
      files,
      user.userId,
      maxImages || 10,
      folder || 'ads',
    );
  }

  /**
   * Upload de avatar
   * POST /uploads/avatar
   */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de avatar' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadsService.uploadAvatar(file, user.userId);
  }

  /**
   * Deleta imagem
   * DELETE /uploads/image/:publicId
   */
  @Delete('image/:publicId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar imagem' })
  async deleteImage(@Param('publicId') publicId: string) {
    await this.uploadsService.deleteImage(publicId);
    return { message: 'Imagem deletada com sucesso' };
  }

  /**
   * Verifica limite de imagens
   * GET /uploads/limit
   */
  @Get('limit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar limite de imagens' })
  async checkImageLimit(@CurrentUser() user: any) {
    return this.uploadsService.checkImageLimit(user.userId);
  }
}
