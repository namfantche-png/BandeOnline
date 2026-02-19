import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Serviço de integração com Cloudinary
 * Gerencia upload e otimização de imagens
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    // Configura Cloudinary com variáveis de ambiente
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Faz upload de imagem para Cloudinary
   * @param file - Arquivo Express (Express.Multer.File)
   * @param folder - Pasta no Cloudinary (ex: 'ads', 'profiles')
   * @returns URL otimizada da imagem
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'bissaumarket'): Promise<string> {
    // Validações
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    // Valida tipo de arquivo
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não suportado. Use JPG, PNG ou WebP');
    }

    // Valida tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo 5MB');
    }

    try {
      // Faz upload para Cloudinary
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `bissaumarket/${folder}`,
            public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto', // Serve WebP se suportado
            aspect_ratio: '1.0',
            crop: 'fill',
            gravity: 'auto',
            // Transformações automáticas para otimização
            transformations: [
              {
                width: 800,
                height: 800,
                crop: 'fill',
              },
            ],
          },
          (error: any, result: UploadApiResponse) => {
            if (error) {
              this.logger.error(`Erro ao fazer upload para Cloudinary: ${error.message}`);
              reject(new BadRequestException('Erro ao fazer upload de imagem'));
            } else {
              resolve(result.secure_url);
            }
          },
        );

        // Converte buffer para stream
        uploadStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error(`Erro inesperado no upload: ${error.message}`);
      throw new BadRequestException('Erro ao processar imagem');
    }
  }

  /**
   * Faz upload de múltiplas imagens
   * @param files - Array de arquivos
   * @param folder - Pasta no Cloudinary
   * @returns Array de URLs otimizadas
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'bissaumarket',
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    // Limita a 10 imagens
    if (files.length > 10) {
      throw new BadRequestException('Máximo 10 imagens por vez');
    }

    try {
      const uploadPromises = files.map((file) => this.uploadImage(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException('Erro ao fazer upload de múltiplas imagens');
    }
  }

  /**
   * Deleta imagem do Cloudinary
   * @param imageUrl - URL da imagem ou public_id
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      return;
    }

    try {
      // Extrai public_id da URL se necessário
      const publicId = this.extractPublicId(imageUrl);

      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            this.logger.warn(`Erro ao deletar imagem: ${error.message}`);
            // Não rejeita, apenas loga o aviso
            resolve();
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      this.logger.warn(`Erro ao deletar imagem: ${error.message}`);
    }
  }

  /**
   * Deleta múltiplas imagens
   * @param imageUrls - Array de URLs ou public_ids
   */
  async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    await Promise.all(deletePromises);
  }

  /**
   * Gera URL otimizada da imagem com transformações
   * @param imageUrl - URL da imagem
   * @param width - Largura desejada (padrão: 400)
   * @param height - Altura desejada (padrão: 400)
   * @param quality - Qualidade (padrão: 'auto')
   * @returns URL otimizada
   */
  getOptimizedUrl(
    imageUrl: string,
    width: number = 400,
    height: number = 400,
    quality: string = 'auto',
  ): string {
    if (!imageUrl) {
      return '';
    }

    // Se já é URL do Cloudinary, aplica transformações
    if (imageUrl.includes('res.cloudinary.com')) {
      return imageUrl
        .replace('/upload/', `/upload/w_${width},h_${height},q_${quality}/`)
        .replace('/upload/w_', `/upload/w_${width},h_${height},q_${quality}/`);
    }

    return imageUrl;
  }

  /**
   * Gera URL thumbnail (miniatura)
   * @param imageUrl - URL da imagem
   * @returns URL otimizada para thumbnail (150x150)
   */
  getThumbnailUrl(imageUrl: string): string {
    return this.getOptimizedUrl(imageUrl, 150, 150, 'auto');
  }

  /**
   * Extrai public_id de uma URL do Cloudinary
   * @param imageUrl - URL da imagem
   * @returns public_id
   */
  private extractPublicId(imageUrl: string): string {
    try {
      // URL formato: https://res.cloudinary.com/cloud/image/upload/v123/folder/public_id.ext
      const parts = imageUrl.split('/');
      const fileWithExt = parts[parts.length - 1];
      const publicIdPart = fileWithExt.split('.')[0];
      const folderPart = parts[parts.length - 2];

      return `${folderPart}/${publicIdPart}`;
    } catch (error) {
      this.logger.warn(`Erro ao extrair public_id de ${imageUrl}`);
      return imageUrl;
    }
  }
}
