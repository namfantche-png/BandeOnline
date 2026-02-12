import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DatabaseService } from '../../config/database.config';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { PlansService } from '../plans/plans.service';
import { UploadsService } from '../uploads/uploads.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

/**
 * Serviço de anúncios
 * Gerencia criação, edição, listagem e exclusão de anúncios
 */
@Injectable()
export class AdsService {
  constructor(
    private db: DatabaseService,
    private plansService: PlansService,
    private subscriptionsService: SubscriptionsService,
    private moduleRef: ModuleRef,
  ) {}

  /**
   * Cria novo anúncio
   * Valida limite de anúncios do plano do usuário
   */
  async createAd(userId: string, createAdDto: CreateAdDto, files: Express.Multer.File[] = []) {
    try {
      // Verifica se categoria existe
      const category = await this.db.category.findUnique({
        where: { id: createAdDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }

      // Obtém plano atual do usuário (retorna plano FREE padrão se não houver subscrição)
      const subscription = await this.subscriptionsService.getActiveSubscription(userId);

      // Conta anúncios ativos do usuário
      const activeAdsCount = await this.db.ad.count({
        where: {
          userId,
          status: 'active',
        },
      });

      // Verifica limite de anúncios
      if (activeAdsCount >= subscription.plan.maxAds) {
        throw new BadRequestException(
          `Limite de ${subscription.plan.maxAds} anúncios atingido. Faça upgrade para criar mais anúncios.`,
        );
      }

      // Processa imagens usando Cloudinary
      const uploadsService = this.moduleRef.get(UploadsService, { strict: false });
      let imageUrls: string[] = [];

      if (files && files.length > 0) {
        try {
          const uploadedImages = await uploadsService.uploadMultipleImages(
            files,
            userId,
            subscription.plan.maxImages,
            'ads',
          );
          imageUrls = uploadedImages.map((img) => img.url);
        } catch (uploadError) {
          console.error('Erro ao fazer upload de imagens:', uploadError);
          // Continua mesmo se upload falhar
          imageUrls = [];
        }
      }

      // Cria anúncio com status 'active' para aparecer imediatamente na plataforma
      const ad = await this.db.ad.create({
        data: {
          userId,
          categoryId: createAdDto.categoryId,
          title: createAdDto.title,
          description: createAdDto.description,
          price: createAdDto.price,
          currency: createAdDto.currency || 'XOF',
          location: createAdDto.location,
          city: createAdDto.city,
          country: createAdDto.country,
          images: imageUrls,
          condition: createAdDto.condition || 'used',
          contactPhone: createAdDto.contactPhone || null,
          contactWhatsapp: createAdDto.contactWhatsapp || null,
          status: 'active', // Ativa automaticamente para aparecer na plataforma
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return ad;
    } catch (error) {
      console.error('Erro em createAd:', error);
      throw error;
    }
  }

  /**
   * Lista todos os anúncios com filtros
   * Ordena destaques primeiro
   */
  async listAds(
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    city?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string,
    featured?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const whereConditions: any[] = [
      { status: 'active' },
    ];

    if (categoryId) whereConditions.push({ categoryId });
    if (city) whereConditions.push({ city });
    if (minPrice || maxPrice) {
      const priceCondition: any = {};
      if (minPrice) priceCondition.gte = minPrice;
      if (maxPrice) priceCondition.lte = maxPrice;
      whereConditions.push({ price: priceCondition });
    }
    
    // Suporte para busca por termo
    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (featured === true) {
      whereConditions.push({ isHighlighted: true });
    }

    const where = whereConditions.length > 1 
      ? { AND: whereConditions }
      : whereConditions[0];

    const [ads, total] = await Promise.all([
      this.db.ad.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ isHighlighted: 'desc' }, { highlightedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.db.ad.count({ where }),
    ]);

    return {
      data: ads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém anúncio por ID
   */
  async getAdById(adId: string) {
    const ad = await this.db.ad.findUnique({
      where: { id: adId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            profile: {
              select: {
                rating: true,
                reviewCount: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    // Incrementa visualizações
    await this.db.ad.update({
      where: { id: adId },
      data: { views: { increment: 1 } },
    });

    return ad;
  }

  /**
   * Lista anúncios do usuário autenticado
   */
  async getUserAds(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      this.db.ad.findMany({
        where: { userId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.ad.count({ where: { userId } }),
    ]);

    return {
      data: ads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atualiza anúncio com suporte a novas imagens
   */
  async updateAd(adId: string, userId: string, updateAdDto: UpdateAdDto, files: Express.Multer.File[] = []) {
    const ad = await this.db.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    if (ad.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este anúncio');
    }

    // Base: imagens existentes a manter (se enviadas) ou todas do anúncio
    let imageUrls: string[] = [];
    if (updateAdDto.existingImages !== undefined && updateAdDto.existingImages !== null) {
      const raw = updateAdDto.existingImages;
      if (Array.isArray(raw)) {
        imageUrls = raw;
      } else if (typeof raw === 'string' && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          imageUrls = Array.isArray(parsed) ? parsed : [];
        } catch {
          imageUrls = [];
        }
      }
    } else {
      imageUrls = [...(ad.images || [])];
    }

    // Adiciona novas imagens enviadas
    if (files && files.length > 0) {
      try {
        const uploadsService = this.moduleRef.get(UploadsService, { strict: false });
        const subscription = await this.subscriptionsService.getActiveSubscription(userId);
        const uploadedImages = await uploadsService.uploadMultipleImages(
          files,
          userId,
          subscription.plan.maxImages,
          'ads',
        );
        imageUrls = [...imageUrls, ...uploadedImages.map((img) => img.url)];
        imageUrls = imageUrls.slice(0, subscription.plan.maxImages);
      } catch (uploadError) {
        console.error('Erro ao fazer upload de imagens:', uploadError);
      }
    }

    // Prepara dados para atualização
    const { existingImages: _existing, ...restDto } = updateAdDto as any;
    const updateData: any = {
      ...restDto,
      images: imageUrls.length > 0 ? imageUrls : undefined,
    };

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    return this.db.ad.update({
      where: { id: adId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Remove anúncio
   */
  async deleteAd(adId: string, userId: string) {
    const ad = await this.db.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    if (ad.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para remover este anúncio');
    }

    return this.db.ad.update({
      where: { id: adId },
      data: { status: 'removed' },
    });
  }

  /**
   * Destaca anúncio (FREE=0, PRO=1+, PREMIUM=ilimitado)
   */
  async highlightAd(adId: string, userId: string) {
    const ad = await this.db.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    if (ad.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para destacar este anúncio');
    }

    const subscription = await this.db.subscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });

    const plan = subscription?.plan ?? (await this.db.plan.findFirst({ where: { name: 'FREE' } }));
    const maxHighlights = plan?.maxHighlights ?? 0;

    if (maxHighlights === 0) {
      throw new BadRequestException('Seu plano não permite destaques');
    }

    const currentHighlighted = await this.db.ad.count({
      where: { userId, isHighlighted: true },
    });

    if (currentHighlighted >= maxHighlights) {
      const oldestHighlighted = await this.db.ad.findFirst({
        where: { userId, isHighlighted: true },
        orderBy: { highlightedAt: 'asc' },
      });
      if (oldestHighlighted && oldestHighlighted.id !== adId) {
        await this.db.ad.update({
          where: { id: oldestHighlighted.id },
          data: { isHighlighted: false, highlightedAt: null },
        });
      }
    }

    return this.db.ad.update({
      where: { id: adId },
      data: { isHighlighted: true, highlightedAt: new Date() },
    });
  }

  /**
   * Remove destaque de anúncio
   */
  async unhighlightAd(adId: string, userId: string) {
    const ad = await this.db.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    if (ad.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para remover destaque deste anúncio');
    }

    return this.db.ad.update({
      where: { id: adId },
      data: { isHighlighted: false, highlightedAt: null },
    });
  }

  /**
   * Busca anúncios por termo com busca semântica melhorada
   * Prioriza correspondências exatas no título, depois descrição, depois categoria
   */
  async searchAds(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const searchTerm = query.trim().toLowerCase();

    // Divide a query em palavras para busca mais flexível
    const searchWords = searchTerm.split(/\s+/).filter((word) => word.length > 2);

    // Cria condições de busca mais inteligentes
    const searchConditions: any[] = [];

    // Busca exata no título (maior prioridade)
    searchConditions.push({ title: { contains: searchTerm, mode: 'insensitive' } });

    // Busca por palavras no título
    if (searchWords.length > 0) {
      searchConditions.push({
        AND: searchWords.map((word) => ({
          title: { contains: word, mode: 'insensitive' },
        })),
      });
    }

    // Busca na descrição
    searchConditions.push({ description: { contains: searchTerm, mode: 'insensitive' } });

    // Busca por palavras na descrição
    if (searchWords.length > 0) {
      searchConditions.push({
        AND: searchWords.map((word) => ({
          description: { contains: word, mode: 'insensitive' },
        })),
      });
    }

    const where: any = {
      AND: [
        { status: 'active' },
        {
          OR: searchConditions,
        },
      ],
    };

    // Busca anúncios
    const [ads, total] = await Promise.all([
      this.db.ad.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.ad.count({ where }),
    ]);

    // Ordena resultados manualmente para melhorar relevância
    const sortedAds = ads.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // Se ambos têm match no título, prioriza o mais recente
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      data: sortedAds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
