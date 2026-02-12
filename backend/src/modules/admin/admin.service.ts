import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import {
  FilterUsersDto,
  BlockUserDto,
  ModerateAdDto,
  AdminCategoryDto,
  AdminPlanDto,
  FinancialReportDto,
  ChangeUserPlanDto,
  UserStatus,
  AdModerationStatus,
} from './dto/admin.dto';

/**
 * Serviço de administração
 * Gerencia todas as funcionalidades do painel administrativo
 */
@Injectable()
export class AdminService {
  constructor(private db: DatabaseService) {}

  // ==========================================
  // DASHBOARD E ESTATÍSTICAS
  // ==========================================

  /**
   * Obtém estatísticas do dashboard
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      totalAds,
      activeAds,
      totalRevenue,
      monthlyRevenue,
      pendingReports,
      pendingAds,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { isBlocked: false } }),
      this.db.ad.count(),
      this.db.ad.count({ where: { status: 'active' } }),
      this.db.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      this.db.payment.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.db.report.count({ where: { status: 'pending' } }),
      this.db.ad.count({ where: { status: 'pending' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalAds,
      activeAds,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingReports,
      pendingAds,
    };
  }

  /**
   * Obtém gráfico de crescimento
   */
  async getGrowthChart(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.db.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    const ads = await this.db.ad.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    return { users, ads };
  }

  // ==========================================
  // GESTÃO DE USUÁRIOS
  // ==========================================

  /**
   * Lista usuários com filtros
   */
  async getUsers(filters: FilterUsersDto) {
    const { search, status, planId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === UserStatus.BLOCKED) {
      where.isBlocked = true;
    } else if (status === UserStatus.ACTIVE) {
      where.isBlocked = false;
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          profile: true,
          subscriptions: {
            where: { status: 'active' },
            include: { plan: true },
            take: 1,
          },
          _count: {
            select: { ads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.user.count({ where }),
    ]);

    const freePlan = await this.db.plan.findFirst({ where: { name: 'FREE' } });

    return {
      data: users.map((user) => ({
        ...user,
        password: undefined, // Remove senha
        currentPlan: user.subscriptions[0]?.plan || freePlan || { id: '', name: 'FREE', maxAds: 3 },
        adsCount: user._count.ads,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém detalhes de um usuário
   */
  async getUserDetails(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        ads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      ...user,
      password: undefined,
    };
  }

  /**
   * Bloqueia usuário
   */
  async blockUser(adminId: string, blockUserDto: BlockUserDto) {
    const { userId, reason, durationDays } = blockUserDto;

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role === 'admin') {
      throw new ForbiddenException('Não é possível bloquear um administrador');
    }

    // Calcula data de desbloqueio
    let blockedUntil: Date | null = null;
    if (durationDays) {
      blockedUntil = new Date();
      blockedUntil.setDate(blockedUntil.getDate() + durationDays);
    }

    // Bloqueia usuário
    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedReason: reason,
        blockedUntil,
      },
    });

    // Registra log
    await this.createAdminLog(adminId, 'BLOCK_USER', 'user', userId, {
      reason,
      durationDays,
    });

    return {
      message: 'Usuário bloqueado com sucesso',
      user: { ...updatedUser, password: undefined },
    };
  }

  /**
   * Desbloqueia usuário
   */
  async unblockUser(adminId: string, userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockedReason: null,
        blockedUntil: null,
      },
    });

    // Registra log
    await this.createAdminLog(adminId, 'UNBLOCK_USER', 'user', userId, {});

    return {
      message: 'Usuário desbloqueado com sucesso',
      user: { ...updatedUser, password: undefined },
    };
  }

  /**
   * Verifica conta de usuário (badge)
   */
  async verifyUser(adminId: string, userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    await this.createAdminLog(adminId, 'VERIFY_USER', 'user', userId, {});

    return {
      message: 'Conta verificada com sucesso',
      user: { ...updatedUser, password: undefined },
    };
  }

  /**
   * Altera plano de um usuário
   */
  async changeUserPlan(adminId: string, changeUserPlanDto: { userId: string; planId: string; reason?: string }) {
    const { userId, planId, reason } = changeUserPlanDto;

    // Verifica se usuário existe
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se plano existe
    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Cancela subscrição ativa anterior (se existir)
    const activeSubscription = await this.db.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (activeSubscription) {
      await this.db.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: 'cancelled' },
      });
    }

    // Cria nova subscrição
    const newSubscription = await this.db.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        startDate: new Date(),
        autoRenew: false, // Admin não renova automaticamente
      },
      include: {
        plan: true,
      },
    });

    // Registra log
    await this.createAdminLog(adminId, 'CHANGE_USER_PLAN', 'subscription', newSubscription.id, {
      userId,
      oldPlanId: activeSubscription?.planId,
      newPlanId: planId,
      reason,
    });

    return {
      message: `Plano alterado para ${plan.name} com sucesso`,
      subscription: newSubscription,
    };
  }

  // ==========================================
  // MODERAÇÃO DE ANÚNCIOS
  // ==========================================

  /**
   * Lista anúncios para moderação
   */
  async getAdsForModeration(status?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [ads, total] = await Promise.all([
      this.db.ad.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
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
   * Modera anúncio (aprovar/rejeitar)
   */
  async moderateAd(adminId: string, moderateAdDto: ModerateAdDto) {
    const { adId, status, reason } = moderateAdDto;

    const ad = await this.db.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    const updatedAd = await this.db.ad.update({
      where: { id: adId },
      data: {
        status: status === AdModerationStatus.APPROVED ? 'active' : status,
        moderationReason: reason,
        moderatedAt: new Date(),
        moderatedBy: adminId,
      },
    });

    await this.createAdminLog(adminId, 'MODERATE_AD', 'ad', adId, {
      status,
      reason,
    });

    return {
      message: `Anúncio ${status === AdModerationStatus.APPROVED ? 'aprovado' : 'rejeitado'} com sucesso`,
      ad: updatedAd,
    };
  }

  /**
   * Remove anúncio
   */
  async removeAd(adminId: string, adId: string, reason: string) {
    const ad = await this.db.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }

    const updatedAd = await this.db.ad.update({
      where: { id: adId },
      data: {
        status: 'removed',
        moderationReason: reason,
        moderatedAt: new Date(),
        moderatedBy: adminId,
      },
    });

    await this.createAdminLog(adminId, 'REMOVE_AD', 'ad', adId, { reason });

    return {
      message: 'Anúncio removido com sucesso',
      ad: updatedAd,
    };
  }

  // ==========================================
  // GESTÃO DE CATEGORIAS
  // ==========================================

  /**
   * Lista todas as categorias (incluindo subcategorias)
   */
  async getAllCategories() {
    const categories = await this.db.category.findMany({
      where: { parentId: null },
      include: {
        subcategories: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { ads: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return categories;
  }

  /**
   * Cria categoria
   */
  async createCategory(adminId: string, categoryDto: AdminCategoryDto) {
    const { name, description, icon, parentId, isActive, order } = categoryDto;

    // Verifica se categoria pai existe
    if (parentId) {
      const parent = await this.db.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Categoria pai não encontrada');
      }
    }

    const category = await this.db.category.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon,
        parentId: parentId || null,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    await this.createAdminLog(adminId, 'CREATE_CATEGORY', 'category', category.id, {
      name,
    });

    return category;
  }

  /**
   * Atualiza categoria
   */
  async updateCategory(adminId: string, categoryId: string, categoryDto: AdminCategoryDto) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const updatedCategory = await this.db.category.update({
      where: { id: categoryId },
      data: categoryDto,
    });

    await this.createAdminLog(adminId, 'UPDATE_CATEGORY', 'category', categoryId, categoryDto);

    return updatedCategory;
  }

  /**
   * Deleta categoria
   */
  async deleteCategory(adminId: string, categoryId: string) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { ads: true, subcategories: true } } },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category._count.ads > 0) {
      throw new BadRequestException('Não é possível deletar categoria com anúncios');
    }

    if (category._count.subcategories > 0) {
      throw new BadRequestException('Não é possível deletar categoria com subcategorias');
    }

    await this.db.category.delete({
      where: { id: categoryId },
    });

    await this.createAdminLog(adminId, 'DELETE_CATEGORY', 'category', categoryId, {});

    return { message: 'Categoria deletada com sucesso' };
  }

  // ==========================================
  // GESTÃO DE PLANOS
  // ==========================================

  /**
   * Lista todos os planos
   */
  async getAllPlans() {
    const plans = await this.db.plan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    return plans;
  }

  /**
   * Cria plano
   */
  async createPlan(adminId: string, planDto: AdminPlanDto) {
    const plan = await this.db.plan.create({
      data: {
        name: planDto.name,
        price: planDto.price,
        currency: planDto.currency || 'XOF',
        maxAds: planDto.maxAds,
        maxHighlights: planDto.maxHighlights,
        maxImages: planDto.maxImages,
        hasStore: planDto.hasStore,
        isActive: planDto.isActive ?? true,
        description: planDto.description,
      },
    });

    await this.createAdminLog(adminId, 'CREATE_PLAN', 'plan', plan.id, planDto);

    return plan;
  }

  /**
   * Atualiza plano
   */
  async updatePlan(adminId: string, planId: string, planDto: AdminPlanDto) {
    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const updatedPlan = await this.db.plan.update({
      where: { id: planId },
      data: planDto,
    });

    await this.createAdminLog(adminId, 'UPDATE_PLAN', 'plan', planId, planDto);

    return updatedPlan;
  }

  /**
   * Desativa plano
   */
  async deactivatePlan(adminId: string, planId: string) {
    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const updatedPlan = await this.db.plan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    await this.createAdminLog(adminId, 'DEACTIVATE_PLAN', 'plan', planId, {});

    return updatedPlan;
  }

  // ==========================================
  // RELATÓRIOS FINANCEIROS
  // ==========================================

  /**
   * Obtém relatório financeiro
   */
  async getFinancialReport(reportDto: FinancialReportDto) {
    const { startDate, endDate, groupBy } = reportDto;

    const where: any = { status: 'completed' };
    if (startDate) where.createdAt = { gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    // Total geral
    const totalRevenue = await this.db.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    // Por método de pagamento
    const byMethod = await this.db.payment.groupBy({
      by: ['method'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    // Por plano
    const subscriptions = await this.db.subscription.findMany({
      where: {
        createdAt: where.createdAt,
      },
      include: { plan: true },
    });

    const byPlan = subscriptions.reduce((acc, sub) => {
      const planName = sub.plan?.name || 'Unknown';
      if (!acc[planName]) {
        acc[planName] = { count: 0, revenue: 0 };
      }
      acc[planName].count += 1;
      acc[planName].revenue += sub.plan?.price || 0;
      return acc;
    }, {});

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions: totalRevenue._count,
      byMethod,
      byPlan,
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'now',
      },
    };
  }

  /**
   * Obtém lista de pagamentos
   */
  async getPayments(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      this.db.payment.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // LOGS DE ADMINISTRAÇÃO
  // ==========================================

  /**
   * Cria log de ação administrativa
   */
  async createAdminLog(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details: any,
  ) {
    return this.db.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: JSON.stringify(details),
      },
    });
  }

  /**
   * Obtém logs de administração
   */
  async getAdminLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.db.adminLog.findMany({
        include: {
          admin: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.adminLog.count(),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // DENÚNCIAS
  // ==========================================

  /**
   * Obtém denúncias pendentes
   */
  async getPendingReports(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.db.report.findMany({
        where: { status: 'pending' },
        include: {
          reporter: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.report.count({ where: { status: 'pending' } }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Resolve denúncia
   */
  async resolveReport(adminId: string, reportId: string, resolution: string, action: 'approve' | 'dismiss') {
    const report = await this.db.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // Atualiza denúncia
    const updatedReport = await this.db.report.update({
      where: { id: reportId },
      data: {
        status: action === 'approve' ? 'resolved' : 'dismissed',
        resolution,
      },
    });

    // Se aprovado, aplica ação
    if (action === 'approve') {
      if (report.reportedUserId) {
        await this.db.user.update({
          where: { id: report.reportedUserId },
          data: {
            isBlocked: true,
            blockedReason: `Denúncia aprovada: ${resolution}`,
          },
        });
      }

      if (report.reportedAdId) {
        await this.db.ad.update({
          where: { id: report.reportedAdId },
          data: { status: 'removed' },
        });
      }
    }

    await this.createAdminLog(adminId, 'RESOLVE_REPORT', 'report', reportId, {
      action,
      resolution,
    });

    return {
      message: `Denúncia ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`,
      report: updatedReport,
    };
  }
}
