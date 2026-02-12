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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = exports.NotificationType = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
const email_service_1 = require("./email.service");
var NotificationType;
(function (NotificationType) {
    NotificationType["AD_EXPIRED"] = "ad_expired";
    NotificationType["AD_APPROVED"] = "ad_approved";
    NotificationType["AD_REJECTED"] = "ad_rejected";
    NotificationType["SUBSCRIPTION_RENEWED"] = "subscription_renewed";
    NotificationType["PAYMENT_SUCCESS"] = "payment_success";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["MESSAGE_RECEIVED"] = "message_received";
    NotificationType["REVIEW_RECEIVED"] = "review_received";
    NotificationType["USER_BLOCKED"] = "user_blocked";
    NotificationType["USER_UNBLOCKED"] = "user_unblocked";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let NotificationsService = NotificationsService_1 = class NotificationsService {
    db;
    emailService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(db, emailService) {
        this.db = db;
        this.emailService = emailService;
        this.logger.debug('NotificationsService initialized successfully');
    }
    async sendNotification(data) {
        try {
            const notification = await this.db.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: data.data || {},
                    isRead: false,
                },
            });
            if (data.sendEmail !== false && this.emailService) {
                try {
                    const user = await this.db.user.findUnique({
                        where: { id: data.userId },
                        select: { email: true, firstName: true },
                    });
                    if (user) {
                        await this.emailService.sendNotificationEmail(user.email, user.firstName, data.title, data.message, data.type);
                    }
                }
                catch (emailError) {
                    this.logger.warn(`Erro ao enviar email de notificação: ${emailError.message}`);
                }
            }
            return notification;
        }
        catch (error) {
            this.logger.error(`Erro ao criar notificação: ${error.message}`);
            throw error;
        }
    }
    async notifyAdExpired(userId, adTitle) {
        return this.sendNotification({
            userId,
            type: NotificationType.AD_EXPIRED,
            title: 'Anúncio Expirado',
            message: `Seu anúncio "${adTitle}" expirou. Renove-o para continuar aparecendo na plataforma.`,
            data: { adTitle },
            sendEmail: true,
        });
    }
    async notifyAdApproved(userId, adTitle) {
        return this.sendNotification({
            userId,
            type: NotificationType.AD_APPROVED,
            title: 'Anúncio Aprovado',
            message: `Seu anúncio "${adTitle}" foi aprovado e está agora visível na plataforma.`,
            data: { adTitle },
            sendEmail: true,
        });
    }
    async notifyAdRejected(userId, adTitle, reason) {
        return this.sendNotification({
            userId,
            type: NotificationType.AD_REJECTED,
            title: 'Anúncio Rejeitado',
            message: `Seu anúncio "${adTitle}" foi rejeitado.${reason ? ` Motivo: ${reason}` : ''}`,
            data: { adTitle, reason },
            sendEmail: true,
        });
    }
    async notifySubscriptionRenewed(userId, planName) {
        return this.sendNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_RENEWED,
            title: 'Subscrição Renovada',
            message: `Sua subscrição do plano ${planName} foi renovada com sucesso.`,
            data: { planName },
            sendEmail: true,
        });
    }
    async notifyPaymentSuccess(userId, amount, currency) {
        return this.sendNotification({
            userId,
            type: NotificationType.PAYMENT_SUCCESS,
            title: 'Pagamento Confirmado',
            message: `Seu pagamento de ${amount} ${currency} foi processado com sucesso.`,
            data: { amount, currency },
            sendEmail: true,
        });
    }
    async notifyPaymentFailed(userId, amount, currency, reason) {
        return this.sendNotification({
            userId,
            type: NotificationType.PAYMENT_FAILED,
            title: 'Falha no Pagamento',
            message: `Não foi possível processar seu pagamento de ${amount} ${currency}.${reason ? ` Motivo: ${reason}` : ''}`,
            data: { amount, currency, reason },
            sendEmail: true,
        });
    }
    async notifyMessageReceived(userId, senderName, messagePreview) {
        return this.sendNotification({
            userId,
            type: NotificationType.MESSAGE_RECEIVED,
            title: `Nova mensagem de ${senderName}`,
            message: messagePreview,
            data: { senderName, messagePreview },
            sendEmail: false,
        });
    }
    async notifyReviewReceived(userId, reviewerName, rating) {
        return this.sendNotification({
            userId,
            type: NotificationType.REVIEW_RECEIVED,
            title: 'Nova Avaliação',
            message: `${reviewerName} avaliou você com ${rating} estrela(s).`,
            data: { reviewerName, rating },
            sendEmail: true,
        });
    }
    async notifyUserBlocked(userId, reason) {
        return this.sendNotification({
            userId,
            type: NotificationType.USER_BLOCKED,
            title: 'Conta Bloqueada',
            message: `Sua conta foi bloqueada.${reason ? ` Motivo: ${reason}` : ''}`,
            data: { reason },
            sendEmail: true,
        });
    }
    async notifyUserUnblocked(userId) {
        return this.sendNotification({
            userId,
            type: NotificationType.USER_UNBLOCKED,
            title: 'Conta Desbloqueada',
            message: 'Sua conta foi desbloqueada. Você pode usar a plataforma novamente.',
            sendEmail: true,
        });
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.db.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.notification.count({ where: { userId } }),
            this.db.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            unreadCount,
        };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.db.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification || notification.userId !== userId) {
            throw new Error('Notificação não encontrada');
        }
        return this.db.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.db.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async deleteNotification(notificationId, userId) {
        const notification = await this.db.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification || notification.userId !== userId) {
            throw new Error('Notificação não encontrada');
        }
        return this.db.notification.delete({
            where: { id: notificationId },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [database_config_1.DatabaseService,
        email_service_1.EmailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map