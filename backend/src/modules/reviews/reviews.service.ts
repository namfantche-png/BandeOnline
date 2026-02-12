import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

/**
 * Serviço de avaliações
 * Gerencia avaliações de vendedores
 */
@Injectable()
export class ReviewsService {
  constructor(private db: DatabaseService) {}

  /**
   * Cria avaliação para um vendedor
   */
  async createReview(reviewerId: string, createReviewDto: CreateReviewDto) {
    const { reviewedUserId, rating, comment, adId } = createReviewDto;

    // Verifica se não está avaliando a si mesmo
    if (reviewerId === reviewedUserId) {
      throw new BadRequestException('Você não pode avaliar a si mesmo');
    }

    // Verifica se usuário avaliado existe
    const reviewedUser = await this.db.user.findUnique({
      where: { id: reviewedUserId },
    });

    if (!reviewedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se anúncio existe (se informado)
    if (adId) {
      const ad = await this.db.ad.findUnique({
        where: { id: adId },
      });

      if (!ad) {
        throw new NotFoundException('Anúncio não encontrado');
      }

      // Verifica se já existe avaliação para este anúncio
      const existingReview = await this.db.review.findFirst({
        where: {
          reviewerId,
          reviewedUserId,
          adId,
        },
      });

      if (existingReview) {
        throw new ConflictException('Você já avaliou este vendedor para este anúncio');
      }
    }

    // Cria avaliação
    const review = await this.db.review.create({
      data: {
        reviewerId,
        reviewedUserId,
        rating,
        comment,
        adId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Atualiza rating médio do usuário avaliado
    await this.updateUserRating(reviewedUserId);

    return review;
  }

  /**
   * Obtém avaliações recebidas por um usuário
   */
  async getReviewsForUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.db.review.findMany({
        where: { reviewedUserId: userId },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          ad: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.review.count({ where: { reviewedUserId: userId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém avaliações feitas por um usuário
   */
  async getReviewsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.db.review.findMany({
        where: { reviewerId: userId },
        include: {
          reviewedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          ad: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.review.count({ where: { reviewerId: userId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém estatísticas de avaliação de um usuário
   */
  async getReviewStats(userId: string) {
    const reviews = await this.db.review.findMany({
      where: { reviewedUserId: userId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calcula média
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Math.round((sum / reviews.length) * 10) / 10;

    // Calcula distribuição
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  /**
   * Obtém uma avaliação por ID
   */
  async getReviewById(reviewId: string) {
    const review = await this.db.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reviewedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        ad: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return review;
  }

  /**
   * Atualiza avaliação
   */
  async updateReview(reviewId: string, reviewerId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.reviewerId !== reviewerId) {
      throw new BadRequestException('Você não tem permissão para editar esta avaliação');
    }

    const updatedReview = await this.db.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Atualiza rating médio do usuário avaliado
    await this.updateUserRating(review.reviewedUserId);

    return updatedReview;
  }

  /**
   * Deleta avaliação
   */
  async deleteReview(reviewId: string, reviewerId: string) {
    const review = await this.db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.reviewerId !== reviewerId) {
      throw new BadRequestException('Você não tem permissão para deletar esta avaliação');
    }

    await this.db.review.delete({
      where: { id: reviewId },
    });

    // Atualiza rating médio do usuário avaliado
    await this.updateUserRating(review.reviewedUserId);

    return { message: 'Avaliação deletada com sucesso' };
  }

  /**
   * Atualiza rating médio do usuário
   */
  private async updateUserRating(userId: string) {
    const reviews = await this.db.review.findMany({
      where: { reviewedUserId: userId },
      select: { rating: true },
    });

    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    // Atualiza perfil do usuário
    await this.db.profile.upsert({
      where: { userId },
      update: {
        rating: averageRating,
        reviewCount: reviews.length,
      },
      create: {
        userId,
        rating: averageRating,
        reviewCount: reviews.length,
      },
    });
  }

  /**
   * Verifica se usuário pode avaliar outro
   * (deve ter feito uma transação/conversa)
   */
  async canReview(reviewerId: string, reviewedUserId: string): Promise<boolean> {
    // Verifica se houve conversa entre os usuários
    const hasConversation = await this.db.message.findFirst({
      where: {
        OR: [
          { senderId: reviewerId, receiverId: reviewedUserId },
          { senderId: reviewedUserId, receiverId: reviewerId },
        ],
      },
    });

    return !!hasConversation;
  }
}
