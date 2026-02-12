import { DatabaseService } from '../../config/database.config';
import { UpgradePlanDto } from './dto/subscription.dto';
export declare class SubscriptionsService {
    private db;
    constructor(db: DatabaseService);
    getActiveSubscription(userId: string): Promise<({
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
    getSubscriptionHistory(userId: string, page?: number, limit?: number): Promise<{
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
    upgradePlan(userId: string, upgradePlanDto: UpgradePlanDto): Promise<{
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
    cancelSubscription(userId: string): Promise<{
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
    renewSubscription(userId: string): Promise<{
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
    canCreateAd(userId: string): Promise<boolean>;
    getAdsLimit(userId: string): Promise<{
        used: number;
        max: number;
    }>;
    getHighlightsLimit(userId: string): Promise<{
        used: number;
        max: number;
    }>;
}
