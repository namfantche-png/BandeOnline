import { NotificationType } from './notifications.service';
export declare class EmailService {
    private readonly logger;
    private transporter;
    constructor();
    sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void>;
    sendNotificationEmail(email: string, firstName: string, title: string, message: string, type: NotificationType): Promise<void>;
    private sendEmail;
    private getNotificationIcon;
    private getNotificationColor;
}
