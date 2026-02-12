"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const database_config_1 = require("../../config/database.config");
const notifications_service_1 = require("../notifications/notifications.service");
const payments_service_1 = require("../payments/payments.service");
const payment_dto_1 = require("../payments/dto/payment.dto");
let TasksService = TasksService_1 = class TasksService {
    db;
    moduleRef;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(db, moduleRef) {
        this.db = db;
        this.moduleRef = moduleRef;
    }
    async expireAds() {
        this.logger.log('Iniciando tarefa de expiração de anúncios...');
        try {
            const now = new Date();
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
            const result = await this.db.ad.updateMany({
                where: {
                    id: { in: expiredAds.map((ad) => ad.id) },
                },
                data: { status: 'expired' },
            });
            this.logger.log(`${result.count} anúncios expirados`);
            const notificationsService = this.moduleRef.get(notifications_service_1.NotificationsService, { strict: false });
            for (const ad of expiredAds) {
                try {
                    await notificationsService.notifyAdExpired(ad.userId, ad.title);
                }
                catch (error) {
                    this.logger.warn(`Erro ao notificar usuário ${ad.userId}:`, error.message);
                }
            }
        }
        catch (error) {
            this.logger.error('Erro ao expirar anúncios:', error);
        }
    }
    async removeExpiredHighlights() {
        this.logger.log('Verificando destaques expirados...');
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
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
        }
        catch (error) {
            this.logger.error('Erro ao remover destaques:', error);
        }
    }
    async renewSubscriptions() {
        this.logger.log('Verificando subscrições para renovação...');
        try {
            const now = new Date();
            const subscriptionsToRenew = await this.db.subscription.findMany({
                where: {
                    status: 'active',
                    autoRenew: true,
                    renewalDate: { lte: now },
                },
                include: { plan: true, user: true },
            });
            for (const subscription of subscriptionsToRenew) {
                const newRenewalDate = new Date();
                newRenewalDate.setDate(newRenewalDate.getDate() + 30);
                const paymentsService = this.moduleRef.get(payments_service_1.PaymentsService, { strict: false });
                try {
                    const payment = await paymentsService.initiatePayment(subscription.user.id, {
                        amount: subscription.plan.price,
                        currency: subscription.plan.currency,
                        method: payment_dto_1.PaymentMethod.MOBILE_MONEY,
                        provider: payment_dto_1.MobileMoneyProvider.ORANGE_MONEY,
                        planId: subscription.planId,
                        description: `Renovação automática - Plano ${subscription.plan.name}`,
                    });
                    if (process.env.AUTO_RENEWAL_CONFIRM === 'true') {
                        await paymentsService.confirmPayment(subscription.user.id, {
                            paymentId: payment.paymentId,
                            transactionId: payment.transactionId,
                        });
                    }
                    await this.db.subscription.update({
                        where: { id: subscription.id },
                        data: { renewalDate: newRenewalDate },
                    });
                    const notificationsService = this.moduleRef.get(notifications_service_1.NotificationsService, { strict: false });
                    await notificationsService.notifySubscriptionRenewed(subscription.user.id, subscription.plan.name);
                    this.logger.log(`Subscrição ${subscription.id} renovada para ${subscription.user.email}`);
                }
                catch (error) {
                    this.logger.error(`Erro ao processar renovação da subscrição ${subscription.id}:`, error.message);
                    await this.db.subscription.update({
                        where: { id: subscription.id },
                        data: { status: 'pending_renewal' },
                    });
                }
            }
            if (subscriptionsToRenew.length > 0) {
                this.logger.log(`${subscriptionsToRenew.length} subscrições renovadas`);
            }
        }
        catch (error) {
            this.logger.error('Erro ao renovar subscrições:', error);
        }
    }
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
        }
        catch (error) {
            this.logger.error('Erro ao desbloquear usuários:', error);
        }
    }
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
        }
        catch (error) {
            this.logger.error('Erro ao limpar tokens:', error);
        }
    }
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
            await this.db.dailyReport.upsert({
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
        }
        catch (error) {
            this.logger.error('Erro ao gerar relatório:', error);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "expireAds", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "removeExpiredHighlights", null);
__decorate([
    (0, schedule_1.Cron)('0 6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "renewSubscriptions", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "unblockExpiredUsers", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "cleanupExpiredTokens", null);
__decorate([
    (0, schedule_1.Cron)('0 23 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "generateDailyReport", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService,
        core_1.ModuleRef])
], TasksService);
//# sourceMappingURL=tasks.service.js.map