import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../../config/database.config';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço de upload de imagens
 * Integra com Cloudinary para armazenamento de imagens
 */
@Injectable()
export class UploadsService {
  constructor(private db: DatabaseService) {
    // Configura Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload de imagem para Cloudinary com fallback para armazenamento local
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'ads',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Tipos de imagem permitidos (inclui formatos comuns)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'image/bmp', 'image/tiff', 'image/avif', 'image/heic', 'image/svg+xml',
      'image/x-icon', 'image/vnd.microsoft.icon',
    ];
    const normalizedMime = file.mimetype.toLowerCase();
    if (!allowedTypes.includes(normalizedMime)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Use JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF ou HEIC.',
      );
    }

    // Verifica tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo 5MB.');
    }

    // Tenta fazer upload no Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `bissaumarket/${folder}`,
                public_id: `${userId}_${uuidv4()}`,
                resource_type: 'image',
                transformation: [
                  { width: 1200, height: 1200, crop: 'limit' }, // Limita tamanho
                  { quality: 'auto:good' }, // Otimiza qualidade
                  { fetch_format: 'auto' }, // Formato automático
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              },
            )
            .end(file.buffer);
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      } catch (error) {
        console.error('Erro ao fazer upload em Cloudinary:', error);
        // Continua com fallback local
      }
    }

    // Fallback: gravar em disco e retornar URL local
    const ext = this.getFileExtension(file.mimetype);
    const imageId = `${userId}_${uuidv4()}`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    const filename = `${imageId}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(filepath, file.buffer);
    } catch (err) {
      console.error('Erro ao gravar imagem local:', err);
      throw new InternalServerErrorException('Erro ao salvar imagem');
    }

    const localUrl = `/uploads/images/${filename}`;
    return {
      url: localUrl,
      publicId: imageId,
    };
  }

  /**
   * Obtém extensão de arquivo baseado no MIME type
   */
  private getFileExtension(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/jpg': 'jpg',
      'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
      'image/bmp': 'bmp', 'image/tiff': 'tiff', 'image/avif': 'avif',
      'image/heic': 'heic', 'image/svg+xml': 'svg',
      'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico',
    };
    return mimeMap[mimeType?.toLowerCase()] || 'jpg';
  }

  /**
   * Upload de múltiplas imagens
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    userId: string,
    maxImages: number,
    folder: string = 'ads',
  ): Promise<{ url: string; publicId: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    if (files.length > maxImages) {
      throw new BadRequestException(
        `Máximo de ${maxImages} imagens permitidas`,
      );
    }

    const uploadPromises = files.map((file) =>
      this.uploadImage(file, userId, folder),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Deleta imagem do Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      // Não lança erro para não bloquear operações
    }
  }

  /**
   * Deleta múltiplas imagens
   */
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) return;

    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Erro ao deletar imagens:', error);
    }
  }

  /**
   * Upload de avatar
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Verifica tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.',
      );
    }

    // Verifica tamanho (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo 2MB.');
    }

    try {
      // Upload para Cloudinary com transformações específicas para avatar
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'bissaumarket/avatars',
              public_id: `avatar_${userId}`,
              resource_type: 'image',
              overwrite: true, // Sobrescreve avatar anterior
              transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(file.buffer);
      });

      // Atualiza avatar no banco
      await this.db.user.update({
        where: { id: userId },
        data: { avatar: result.secure_url },
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw new InternalServerErrorException('Erro ao fazer upload do avatar');
    }
  }

  /**
   * Gera URL de thumbnail
   */
  generateThumbnailUrl(publicId: string, width: number = 300, height: number = 300): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto:low',
      fetch_format: 'auto',
    });
  }

  /**
   * Verifica limite de imagens por plano
   */
  async checkImageLimit(userId: string): Promise<{ current: number; max: number }> {
    // Busca plano do usuário
    const subscription = await this.db.subscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });

    const maxImages = subscription?.plan?.maxImages || 3; // FREE = 3 imagens

    // Conta imagens atuais do usuário (em anúncios ativos)
    const ads = await this.db.ad.findMany({
      where: { userId, status: 'active' },
      select: { images: true },
    });

    const currentImages = ads.reduce((total, ad) => {
      const images = ad.images as string[];
      return total + (images?.length || 0);
    }, 0);

    return { current: currentImages, max: maxImages };
  }
}
