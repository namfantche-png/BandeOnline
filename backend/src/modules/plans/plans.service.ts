import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { CreatePlanDto } from './dto/plan.dto';

/**
 * Serviço de planos
 * Gerencia planos de subscrição (FREE, PRO, PREMIUM)
 */
@Injectable()
export class PlansService {
  constructor(private db: DatabaseService) {}

  /**
   * Cria novo plano (admin only)
   */
  async createPlan(createPlanDto: CreatePlanDto) {
    return this.db.plan.create({
      data: {
        name: createPlanDto.name,
        description: createPlanDto.description,
        price: createPlanDto.price,
        currency: createPlanDto.currency || 'XOF',
        maxAds: createPlanDto.maxAds,
        maxHighlights: createPlanDto.maxHighlights,
        hasStore: createPlanDto.hasStore,
        features: createPlanDto.features || [],
      },
    });
  }

  /**
   * Lista todos os planos ativos
   */
  async getAllPlans() {
    return this.db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Obtém plano por ID
   */
  async getPlanById(planId: string) {
    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plan;
  }

  /**
   * Obtém plano por nome
   */
  async getPlanByName(name: string) {
    const plan = await this.db.plan.findUnique({
      where: { name },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plan;
  }

  /**
   * Atualiza plano (admin only)
   */
  async updatePlan(planId: string, updatePlanDto: CreatePlanDto) {
    return this.db.plan.update({
      where: { id: planId },
      data: {
        name: updatePlanDto.name,
        description: updatePlanDto.description,
        price: updatePlanDto.price,
        currency: updatePlanDto.currency,
        maxAds: updatePlanDto.maxAds,
        maxHighlights: updatePlanDto.maxHighlights,
        hasStore: updatePlanDto.hasStore,
        features: updatePlanDto.features,
      },
    });
  }

  /**
   * Desativa plano (admin only)
   */
  async deactivatePlan(planId: string) {
    return this.db.plan.update({
      where: { id: planId },
      data: { isActive: false },
    });
  }

  /**
   * Inicializa planos padrão
   */
  async initializeDefaultPlans() {
    const existingPlans = await this.db.plan.count();

    if (existingPlans > 0) {
      return;
    }

    const defaultPlans = [
      {
        name: 'FREE',
        description: 'Plano gratuito com funcionalidades básicas',
        price: 0,
        currency: 'XOF',
        maxAds: 3,
        maxHighlights: 0,
        hasStore: false,
        features: ['Criar até 3 anúncios', 'Sem destaques', 'Chat com compradores', 'Perfil básico'],
      },
      {
        name: 'PRO',
        description: 'Plano profissional para vendedores ativos',
        price: 5000,
        currency: 'XOF',
        maxAds: 20,
        maxHighlights: 1,
        hasStore: false,
        features: [
          'Criar até 20 anúncios',
          '1 anúncio em destaque',
          'Chat prioritário',
          'Estatísticas de visualizações',
        ],
      },
      {
        name: 'PREMIUM',
        description: 'Plano premium com todas as funcionalidades',
        price: 15000,
        currency: 'XOF',
        maxAds: 999,
        maxHighlights: 999,
        hasStore: true,
        features: [
          'Anúncios ilimitados',
          'Destaques ilimitados',
          'Loja virtual',
          'Chat prioritário',
          'Estatísticas avançadas',
          'Suporte dedicado',
        ],
      },
    ];

    for (const plan of defaultPlans) {
      await this.db.plan.create({ data: plan });
    }
  }
}
