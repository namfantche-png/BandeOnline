import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { UpgradePlanDto } from './dto/subscription.dto';

/**
 * Serviço de subscrições
 * Gerencia subscrições, upgrades e renovações de planos
 */
@Injectable()
export class SubscriptionsService {
  constructor(private db: DatabaseService) {}

  /**
   * Obtém subscrição ativa do usuário
   * Retorna plano FREE padrão se nenhuma subscrição ativa encontrada
   */
  async getActiveSubscription(userId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      // Retorna plano FREE padrão quando usuário não tem subscrição ativa
      const freePlan = await this.db.plan.findFirst({
        where: { name: 'FREE' },
      });

      return {
        id: `free-${userId}`,
        userId,
        planId: freePlan?.id,
        plan: freePlan || {
          id: 'free-plan',
          name: 'FREE',
          description: 'Plano Free',
          price: 0,
          currency: 'XOF',
          features: [],
          maxAds: 3,
          maxImages: 3,
          maxHighlights: 0,
          hasStore: false,
          adDuration: 30,
          duration: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        status: 'active',
        startDate: new Date(),
        endDate: null,
        autoRenewal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return subscription;
  }

  /**
   * Obtém histórico de subscrições do usuário
   */
  async getSubscriptionHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.db.subscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.subscription.count({ where: { userId } }),
    ]);

    return {
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Faz upgrade de plano
   */
  async upgradePlan(userId: string, upgradePlanDto: UpgradePlanDto) {
    const { planId } = upgradePlanDto;

    // Verifica se plano existe
    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Obtém subscrição ativa
    const currentSubscription = await this.db.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });

    if (!currentSubscription) {
      throw new BadRequestException('Usuário sem subscrição ativa');
    }

    // Verifica se é upgrade (preço maior)
    if (plan.price <= currentSubscription.plan.price) {
      throw new BadRequestException('Selecione um plano com preço maior para fazer upgrade');
    }

    // Cancela subscrição anterior
    await this.db.subscription.update({
      where: { id: currentSubscription.id },
      data: { status: 'cancelled' },
    });

    // Cria nova subscrição
    const newSubscription = await this.db.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        autoRenew: true,
      },
      include: {
        plan: true,
      },
    });

    return newSubscription;
  }

  /**
   * Cancela subscrição
   */
  async cancelSubscription(userId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (!subscription) {
      throw new NotFoundException('Nenhuma subscrição ativa para cancelar');
    }

    return this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        endDate: new Date(),
      },
    });
  }

  /**
   * Renova subscrição (automático ou manual)
   */
  async renewSubscription(userId: string) {
    const subscription = await this.db.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Nenhuma subscrição ativa para renovar');
    }

    // Calcula data de renovação (30 dias)
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    return this.db.subscription.update({
      where: { id: subscription.id },
      data: {
        renewalDate,
        autoRenew: true,
      },
    });
  }

  /**
   * Verifica se usuário pode criar mais anúncios
   */
  async canCreateAd(userId: string): Promise<boolean> {
    const subscription = await this.db.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return false;
    }

    const adsCount = await this.db.ad.count({
      where: {
        userId,
        status: 'active',
      },
    });

    return adsCount < subscription.plan.maxAds;
  }

  /**
   * Obtém limite de anúncios do usuário
   * Usa o plano da subscrição ativa ou FREE padrão
   */
  async getAdsLimit(userId: string): Promise<{ used: number; max: number }> {
    // Obtém subscrição ativa (retorna plano FREE se não houver subscrição)
    const subscription = await this.getActiveSubscription(userId);

    // Conta anúncios ativos do usuário
    const used = await this.db.ad.count({
      where: {
        userId,
        status: 'active',
      },
    });

    return {
      used,
      max: subscription.plan.maxAds,
    };
  }

  /**
   * Obtém limite de destaques do usuário
   * Usa o plano da subscrição ativa ou FREE padrão
   */
  async getHighlightsLimit(userId: string): Promise<{ used: number; max: number }> {
    // Obtém subscrição ativa (retorna plano FREE se não houver subscrição)
    const subscription = await this.getActiveSubscription(userId);

    // Conta destaques ativos do usuário
    const used = await this.db.ad.count({
      where: {
        userId,
        isHighlighted: true,
      },
    });

    return {
      used,
      max: subscription.plan.maxHighlights,
    };
  }
}
