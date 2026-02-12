export declare enum PaymentMethod {
    MOBILE_MONEY = "mobile_money",
    CARD = "card",
    BANK = "bank"
}
export declare enum MobileMoneyProvider {
    ORANGE_MONEY = "orange_money",
    MTN_MONEY = "mtn_money"
}
export declare class InitiatePaymentDto {
    amount: number;
    currency?: string;
    method: PaymentMethod;
    provider?: MobileMoneyProvider;
    planId: string;
    description?: string;
}
export declare class ConfirmPaymentDto {
    transactionId: string;
    paymentId: string;
}
export declare class PaymentResponseDto {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    provider?: string;
    transactionId?: string;
    description?: string;
    createdAt: Date;
}
