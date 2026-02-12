import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, page?: string, limit?: string): Promise<{
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
