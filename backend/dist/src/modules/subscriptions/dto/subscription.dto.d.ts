export declare class UpgradePlanDto {
    planId: string;
}
export declare class SubscriptionResponseDto {
    id: string;
    userId: string;
    planId: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    renewalDate?: Date;
    autoRenew: boolean;
    plan: {
        id: string;
        name: string;
        price: number;
        maxAds: number;
        maxHighlights: number;
    };
}
