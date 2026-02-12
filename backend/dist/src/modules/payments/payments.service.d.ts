import { DatabaseService } from '../../config/database.config';
import { InitiatePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    private db;
    constructor(db: DatabaseService);
    initiatePayment(userId: string, initiatePaymentDto: InitiatePaymentDto): Promise<{
        paymentId: string;
        transactionId: string;
        amount: number;
        currency: string;
        method: import("./dto/payment.dto").PaymentMethod;
        provider: import("./dto/payment.dto").MobileMoneyProvider | undefined;
        status: string;
        message: string;
        redirectUrl: string | null;
        expiresAt: Date;
    }>;
    confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto): Promise<{
        id: string;
        status: string;
        transactionId: string;
        amount: number;
        currency: string;
        message: string;
    }>;
    getPaymentHistory(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            userId: string;
            description: string | null;
            currency: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            subscriptionId: string | null;
            amount: number;
            method: string;
            provider: string | null;
            transactionId: string | null;
            failureReason: string | null;
            completedAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getPaymentDetails(paymentId: string, userId: string): Promise<{
        id: string;
        userId: string;
        description: string | null;
        currency: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string | null;
        amount: number;
        method: string;
        provider: string | null;
        transactionId: string | null;
        failureReason: string | null;
        completedAt: Date | null;
    }>;
    webhookPaymentConfirmation(transactionId: string): Promise<{
        id: string;
        userId: string;
        description: string | null;
        currency: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionId: string | null;
        amount: number;
        method: string;
        provider: string | null;
        transactionId: string | null;
        failureReason: string | null;
        completedAt: Date | null;
    }>;
    getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
        totalPayments: number;
        completedPayments: number;
        failedPayments: number;
        successRate: number;
        totalRevenue: number;
    }>;
    private getOrangeMoneyUrl;
    private getMTNMobileMoneyUrl;
    private getCardPaymentUrl;
    private verifyPaymentWithGateway;
}
