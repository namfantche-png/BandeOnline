import { Injectable, Logger, Optional } from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { EmailService } from './email.service';

export enum NotificationType {
  AD_EXPIRED = 'ad_expired',
  AD_APPROVED = 'ad_approved',
  AD_REJECTED = 'ad_rejected',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  MESSAGE_RECEIVED = 'message_received',
  REVIEW_RECEIVED = 'review_received',
  USER_BLOCKED = 'user_blocked',
  USER_UNBLOCKED = 'user_unblocked',
}

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
}

/**
 * Serviço de notificações
 * Gerencia notificações do sistema e envio de emails
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private db: DatabaseService,
    @Optional() private emailService?: EmailService,
  ) {
    this.logger.debug('NotificationsService initialized successfully');
  }

  /**
   * Cria e envia notificação
   */
  async sendNotification(data: NotificationData) {
    try {
      // Cria registro de notificação no banco
      const notification = await (this.db as any).notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          isRead: false,
        },
      });

      // Envia email se solicitado
      if (data.sendEmail !== false && this.emailService) {
        try {
          const user = await this.db.user.findUnique({
            where: { id: data.userId },
            select: { email: true, firstName: true },
          });

          if (user) {
            await this.emailService.sendNotificationEmail(
              user.email,
              user.firstName,
              data.title,
              data.message,
              data.type,
            );
          }
        } catch (emailError) {
          this.logger.warn(`Erro ao enviar email de notificação: ${emailError.message}`);
          // Não falha a notificação se o email falhar
        }
      }

      return notification;
    } catch (error) {
      this.logger.error(`Erro ao criar notificação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notifica sobre anúncio expirado
   */
  async notifyAdExpired(userId: string, adTitle: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.AD_EXPIRED,
      title: 'Anúncio Expirado',
      message: `Seu anúncio "${adTitle}" expirou. Renove-o para continuar aparecendo na plataforma.`,
      data: { adTitle },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre anúncio aprovado
   */
  async notifyAdApproved(userId: string, adTitle: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.AD_APPROVED,
      title: 'Anúncio Aprovado',
      message: `Seu anúncio "${adTitle}" foi aprovado e está agora visível na plataforma.`,
      data: { adTitle },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre anúncio rejeitado
   */
  async notifyAdRejected(userId: string, adTitle: string, reason?: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.AD_REJECTED,
      title: 'Anúncio Rejeitado',
      message: `Seu anúncio "${adTitle}" foi rejeitado.${reason ? ` Motivo: ${reason}` : ''}`,
      data: { adTitle, reason },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre renovação de subscrição
   */
  async notifySubscriptionRenewed(userId: string, planName: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.SUBSCRIPTION_RENEWED,
      title: 'Subscrição Renovada',
      message: `Sua subscrição do plano ${planName} foi renovada com sucesso.`,
      data: { planName },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre pagamento bem-sucedido
   */
  async notifyPaymentSuccess(userId: string, amount: number, currency: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Pagamento Confirmado',
      message: `Seu pagamento de ${amount} ${currency} foi processado com sucesso.`,
      data: { amount, currency },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre falha no pagamento
   */
  async notifyPaymentFailed(userId: string, amount: number, currency: string, reason?: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Falha no Pagamento',
      message: `Não foi possível processar seu pagamento de ${amount} ${currency}.${reason ? ` Motivo: ${reason}` : ''}`,
      data: { amount, currency, reason },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre nova mensagem
   */
  async notifyMessageReceived(userId: string, senderName: string, messagePreview: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.MESSAGE_RECEIVED,
      title: `Nova mensagem de ${senderName}`,
      message: messagePreview,
      data: { senderName, messagePreview },
      sendEmail: false, // Não envia email para mensagens (muitas notificações)
    });
  }

  /**
   * Notifica sobre nova avaliação
   */
  async notifyReviewReceived(userId: string, reviewerName: string, rating: number) {
    return this.sendNotification({
      userId,
      type: NotificationType.REVIEW_RECEIVED,
      title: 'Nova Avaliação',
      message: `${reviewerName} avaliou você com ${rating} estrela(s).`,
      data: { reviewerName, rating },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre bloqueio de usuário
   */
  async notifyUserBlocked(userId: string, reason?: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.USER_BLOCKED,
      title: 'Conta Bloqueada',
      message: `Sua conta foi bloqueada.${reason ? ` Motivo: ${reason}` : ''}`,
      data: { reason },
      sendEmail: true,
    });
  }

  /**
   * Notifica sobre desbloqueio de usuário
   */
  async notifyUserUnblocked(userId: string) {
    return this.sendNotification({
      userId,
      type: NotificationType.USER_UNBLOCKED,
      title: 'Conta Desbloqueada',
      message: 'Sua conta foi desbloqueada. Você pode usar a plataforma novamente.',
      sendEmail: true,
    });
  }

  /**
   * Obtém notificações do usuário
   */
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      (this.db as any).notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.db as any).notification.count({ where: { userId } }),
      (this.db as any).notification.count({ where: { userId, isRead: false } }),
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

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await (this.db as any).notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificação não encontrada');
    }

    return (this.db as any).notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string) {
    return (this.db as any).notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Deleta notificação
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await (this.db as any).notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notificação não encontrada');
    }

    return (this.db as any).notification.delete({
      where: { id: notificationId },
    });
  }
}
