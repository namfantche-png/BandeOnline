import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { UpdateProfileDto } from './dto/user.dto';

/**
 * Serviço de usuários
 * Gerencia perfis e dados de usuários
 */
@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  /**
   * Obtém perfil completo do usuário
   */
  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      profile: {
        bio: user.profile?.bio,
        location: user.profile?.location,
        city: user.profile?.city,
        country: user.profile?.country,
        rating: user.profile?.rating || 0,
        reviewCount: user.profile?.reviewCount || 0,
        totalAds: user.profile?.totalAds || 0,
      },
    };
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.db.user.update({
      where: { id: userId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
        avatar: updateProfileDto.avatar,
        profile: {
          update: {
            bio: updateProfileDto.bio,
            location: updateProfileDto.location,
            city: updateProfileDto.city,
            country: updateProfileDto.country,
            website: updateProfileDto.website,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      profile: {
        bio: user.profile?.bio,
        location: user.profile?.location,
        city: user.profile?.city,
        country: user.profile?.country,
        rating: user.profile?.rating || 0,
        reviewCount: user.profile?.reviewCount || 0,
        totalAds: user.profile?.totalAds || 0,
      },
    };
  }

  /**
   * Obtém perfil público de um usuário
   */
  async getPublicProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      profile: {
        bio: user.profile?.bio,
        location: user.profile?.location,
        city: user.profile?.city,
        country: user.profile?.country,
        rating: user.profile?.rating || 0,
        reviewCount: user.profile?.reviewCount || 0,
        totalAds: user.profile?.totalAds || 0,
      },
    };
  }

  /**
   * Conta anúncios ativos do usuário
   */
  async getUserAdsCount(userId: string): Promise<number> {
    return this.db.ad.count({
      where: {
        userId,
        status: 'active',
      },
    });
  }

  /**
   * Lista anúncios de um usuário
   */
  async getUserAds(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      this.db.ad.findMany({
        where: {
          userId,
          status: 'active',
        },
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
      this.db.ad.count({
        where: {
          userId,
          status: 'active',
        },
      }),
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
}
