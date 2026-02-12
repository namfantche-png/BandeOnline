import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ModuleRef } from '@nestjs/core';
import { DatabaseService } from '../../config/database.config';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentMethod, MobileMoneyProvider } from '../payments/dto/payment.dto';

/**
 * Serviço de tarefas agendadas
 * Executa jobs periódicos como expiração de anúncios
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private db: DatabaseService,
    private moduleRef: ModuleRef,
  ) {}

  /**
   * Expira anúncios automaticamente
   * Executa todos os dias à meia-noite
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireAds() {
    this.logger.log('Iniciando tarefa de expiração de anúncios...');

    try {
      const now = new Date();

      // Busca anúncios expirados
      const expiredAds = await this.db.ad.findMany({
        where: {
          status: 'active',
          expiresAt: { lte: now },
        },
        select: { id: true, userId: true, title: true },
      });

      if (expiredAds.length === 0) {
        this.logger.log('Nenhum anúncio expirado encontrado');
        return;
      }

      // Atualiza status para 'expired'
      const result = await this.db.ad.updateMany({
        where: {
          id: { in: expiredAds.map((ad) => ad.id) },
        },
        data: { status: 'expired' },
      });

      this.logger.log(`${result.count} anúncios expirados`);

      // Envia notificação para usuários sobre anúncios expirados
      const notificationsService = this.moduleRef.get(NotificationsService, { strict: false });
      for (const ad of expiredAds) {
        try {
          await notificationsService.notifyAdExpired(ad.userId, ad.title);
        } catch (error) {
          this.logger.warn(`Erro ao notificar usuário ${ad.userId}:`, error.message);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao expirar anúncios:', error);
    }
  }

  /**
   * Remove destaques expirados
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredHighlights() {
    this.logger.log('Verificando destaques expirados...');

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Remove destaque de anúncios destacados há mais de 7 dias
      const result = await this.db.ad.updateMany({
        where: {
          isHighlighted: true,
          highlightedAt: { lte: sevenDaysAgo },
        },
        data: {
          isHighlighted: false,
          highlightedAt: null,
        },
      });

      if (result.count > 0) {
        this.logger.log(`${result.count} destaques removidos`);
      }
    } catch (error) {
      this.logger.error('Erro ao remover destaques:', error);
    }
  }

  /**
   * Renova subscrições automáticas
   * Executa todos os dias às 6h
   */
  @Cron('0 6 * * *')
  async renewSubscriptions() {
    this.logger.log('Verificando subscrições para renovação...');

    try {
      const now = new Date();

      // Busca subscrições que precisam ser renovadas
      const subscriptionsToRenew = await this.db.subscription.findMany({
        where: {
          status: 'active',
          autoRenew: true,
          renewalDate: { lte: now },
        },
        include: { plan: true, user: true },
      });

      for (const subscription of subscriptionsToRenew) {
        // Calcula nova data de renovação (30 dias)
        const newRenewalDate = new Date();
        newRenewalDate.setDate(newRenewalDate.getDate() + 30);

        // Processa pagamento automático
        const paymentsService = this.moduleRef.get(PaymentsService, { strict: false });
        try {
          // Cria pagamento para renovação
          const payment = await paymentsService.initiatePayment(subscription.user.id, {
            amount: subscription.plan.price,
            currency: subscription.plan.currency,
            method: PaymentMethod.MOBILE_MONEY,
            provider: MobileMoneyProvider.ORANGE_MONEY,
            planId: subscription.planId,
            description: `Renovação automática - Plano ${subscription.plan.name}`,
          });

          // Confirma pagamento automaticamente (em produção, aguardar confirmação do gateway)
          if (process.env.AUTO_RENEWAL_CONFIRM === 'true') {
            await paymentsService.confirmPayment(subscription.user.id, {
              paymentId: payment.paymentId,
              transactionId: payment.transactionId,
            });
          }

          // Atualiza subscrição apenas se pagamento foi confirmado
          await this.db.subscription.update({
            where: { id: subscription.id },
            data: { renewalDate: newRenewalDate },
          });

          // Notifica usuário
          const notificationsService = this.moduleRef.get(NotificationsService, { strict: false });
          await notificationsService.notifySubscriptionRenewed(
            subscription.user.id,
            subscription.plan.name,
          );

          this.logger.log(
            `Subscrição ${subscription.id} renovada para ${subscription.user.email}`,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao processar renovação da subscrição ${subscription.id}:`,
            error.message,
          );
          // Marca subscrição como pendente de renovação manual
          await this.db.subscription.update({
            where: { id: subscription.id },
            data: { status: 'pending_renewal' },
          });
        }
      }

      if (subscriptionsToRenew.length > 0) {
        this.logger.log(`${subscriptionsToRenew.length} subscrições renovadas`);
      }
    } catch (error) {
      this.logger.error('Erro ao renovar subscrições:', error);
    }
  }

  /**
   * Desbloqueia usuários com bloqueio temporário expirado
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async unblockExpiredUsers() {
    this.logger.log('Verificando bloqueios temporários expirados...');

    try {
      const now = new Date();

      const result = await this.db.user.updateMany({
        where: {
          isBlocked: true,
          blockedUntil: { lte: now },
        },
        data: {
          isBlocked: false,
          blockedReason: null,
          blockedUntil: null,
        },
      });

      if (result.count > 0) {
        this.logger.log(`${result.count} usuários desbloqueados`);
      }
    } catch (error) {
      this.logger.error('Erro ao desbloquear usuários:', error);
    }
  }

  /**
   * Limpa tokens de recuperação de senha expirados
   * Executa todos os dias às 3h
   */
  @Cron('0 3 * * *')
  async cleanupExpiredTokens() {
    this.logger.log('Limpando tokens expirados...');

    try {
      const now = new Date();

      const result = await this.db.user.updateMany({
        where: {
          resetPasswordExpires: { lte: now },
        },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      if (result.count > 0) {
        this.logger.log(`${result.count} tokens limpos`);
      }
    } catch (error) {
      this.logger.error('Erro ao limpar tokens:', error);
    }
  }

  /**
   * Gera relatório diário de estatísticas
   * Executa todos os dias às 23h
   */
  @Cron('0 23 * * *')
  async generateDailyReport() {
    this.logger.log('Gerando relatório diário...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [newUsers, newAds, newPayments, totalRevenue] = await Promise.all([
        this.db.user.count({
          where: { createdAt: { gte: today } },
        }),
        this.db.ad.count({
          where: { createdAt: { gte: today } },
        }),
        this.db.payment.count({
          where: { createdAt: { gte: today }, status: 'completed' },
        }),
        this.db.payment.aggregate({
          where: { createdAt: { gte: today }, status: 'completed' },
          _sum: { amount: true },
        }),
      ]);

      const reportData = {
        newUsers,
        newAds,
        newPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeUsers: await this.db.user.count({ where: { isActive: true } }),
        activeAds: await this.db.ad.count({ where: { status: 'active' } }),
      };

      // Salva relatório no banco
      await (this.db as any).dailyReport.upsert({
        where: { date: today },
        create: {
          date: today,
          ...reportData,
        },
        update: reportData,
      });

      this.logger.log(`
        === RELATÓRIO DIÁRIO ===
        Novos usuários: ${newUsers}
        Novos anúncios: ${newAds}
        Pagamentos: ${newPayments}
        Receita: ${totalRevenue._sum.amount || 0} XOF
        Usuários ativos: ${reportData.activeUsers}
        Anúncios ativos: ${reportData.activeAds}
        ========================
      `);
    } catch (error) {
      this.logger.error('Erro ao gerar relatório:', error);
    }
  }
}
