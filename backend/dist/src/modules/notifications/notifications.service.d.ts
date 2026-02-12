import { DatabaseService } from '../../config/database.config';
import { EmailService } from './email.service';
export declare enum NotificationType {
    AD_EXPIRED = "ad_expired",
    AD_APPROVED = "ad_approved",
    AD_REJECTED = "ad_rejected",
    SUBSCRIPTION_RENEWED = "subscription_renewed",
    PAYMENT_SUCCESS = "payment_success",
    PAYMENT_FAILED = "payment_failed",
    MESSAGE_RECEIVED = "message_received",
    REVIEW_RECEIVED = "review_received",
    USER_BLOCKED = "user_blocked",
    USER_UNBLOCKED = "user_unblocked"
}
export interface NotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    sendEmail?: boolean;
}
export declare class NotificationsService {
    private db;
    private emailService?;
    private readonly logger;
    constructor(db: DatabaseService, emailService?: EmailService | undefined);
    sendNotification(data: NotificationData): Promise<any>;
    notifyAdExpired(userId: string, adTitle: string): Promise<any>;
    notifyAdApproved(userId: string, adTitle: string): Promise<any>;
    notifyAdRejected(userId: string, adTitle: string, reason?: string): Promise<any>;
    notifySubscriptionRenewed(userId: string, planName: string): Promise<any>;
    notifyPaymentSuccess(userId: string, amount: number, currency: string): Promise<any>;
    notifyPaymentFailed(userId: string, amount: number, currency: string, reason?: string): Promise<any>;
    notifyMessageReceived(userId: string, senderName: string, messagePreview: string): Promise<any>;
    notifyReviewReceived(userId: string, reviewerName: string, rating: number): Promise<any>;
    notifyUserBlocked(userId: string, reason?: string): Promise<any>;
    notifyUserUnblocked(userId: string): Promise<any>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
        unreadCount: any;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    deleteNotification(notificationId: string, userId: string): Promise<any>;
}
