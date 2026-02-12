import { SubscriptionsService } from './subscriptions.service';
import { UpgradePlanDto } from './dto/subscription.dto';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getActiveSubscription(user: any): Promise<({
        plan: {
            id: string;
            description: string | null;
            price: number;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            maxAds: number;
            maxHighlights: number;
            maxImages: number;
            hasStore: boolean;
            adDuration: number;
            features: string[];
        };
    } & {
        id: string;
        userId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        renewalDate: Date | null;
        autoRenew: boolean;
    }) | {
        id: string;
        userId: string;
        planId: string | undefined;
        plan: {
            id: string;
            description: string | null;
            price: number;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            maxAds: number;
            maxHighlights: number;
            maxImages: number;
            hasStore: boolean;
            adDuration: number;
            features: string[];
        } | {
            id: string;
            name: string;
            description: string;
            price: number;
            currency: string;
            features: never[];
            maxAds: number;
            maxImages: number;
            maxHighlights: number;
            hasStore: false;
            adDuration: number;
            duration: null;
            isActive: true;
            createdAt: Date;
            updatedAt: Date;
        };
        status: string;
        startDate: Date;
        endDate: null;
        autoRenewal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSubscriptionHistory(user: any, page?: number, limit?: number): Promise<{
        data: ({
            plan: {
                id: string;
                description: string | null;
                price: number;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                maxAds: number;
                maxHighlights: number;
                maxImages: number;
                hasStore: boolean;
                adDuration: number;
                features: string[];
            };
        } & {
            id: string;
            userId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            startDate: Date;
            endDate: Date | null;
            renewalDate: Date | null;
            autoRenew: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    upgradePlan(user: any, upgradePlanDto: UpgradePlanDto): Promise<{
        plan: {
            id: string;
            description: string | null;
            price: number;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            maxAds: number;
            maxHighlights: number;
            maxImages: number;
            hasStore: boolean;
            adDuration: number;
            features: string[];
        };
    } & {
        id: string;
        userId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        renewalDate: Date | null;
        autoRenew: boolean;
    }>;
    cancelSubscription(user: any): Promise<{
        id: string;
        userId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        renewalDate: Date | null;
        autoRenew: boolean;
    }>;
    renewSubscription(user: any): Promise<{
        id: string;
        userId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        startDate: Date;
        endDate: Date | null;
        renewalDate: Date | null;
        autoRenew: boolean;
    }>;
    getAdsLimit(user: any): Promise<{
        used: number;
        max: number;
    }>;
    getHighlightsLimit(user: any): Promise<{
        used: number;
        max: number;
    }>;
}
