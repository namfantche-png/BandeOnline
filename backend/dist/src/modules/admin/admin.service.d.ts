import { DatabaseService } from '../../config/database.config';
import { FilterUsersDto, BlockUserDto, ModerateAdDto, AdminCategoryDto, AdminPlanDto, FinancialReportDto } from './dto/admin.dto';
export declare class AdminService {
    private db;
    constructor(db: DatabaseService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalAds: number;
        activeAds: number;
        totalRevenue: number;
        monthlyRevenue: number;
        pendingReports: number;
        pendingAds: number;
    }>;
    getGrowthChart(days?: number): Promise<{
        users: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.UserGroupByOutputType, "createdAt"[]> & {
            _count: number;
        })[];
        ads: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.AdGroupByOutputType, "createdAt"[]> & {
            _count: number;
        })[];
    }>;
    getUsers(filters: FilterUsersDto): Promise<{
        data: {
            password: undefined;
            currentPlan: {
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
            adsCount: number;
            _count: {
                ads: number;
            };
            profile: {
                id: string;
                userId: string;
                location: string | null;
                city: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                rating: number;
                bio: string | null;
                website: string | null;
                socialLinks: import(".prisma/client/runtime/client").JsonValue | null;
                reviewCount: number;
                totalAds: number;
            } | null;
            subscriptions: ({
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            avatar: string | null;
            role: string;
            isActive: boolean;
            isBlocked: boolean;
            blockedReason: string | null;
            blockedUntil: Date | null;
            isVerified: boolean;
            refreshToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            lastLoginAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserDetails(userId: string): Promise<{
        password: undefined;
        profile: {
            id: string;
            userId: string;
            location: string | null;
            city: string | null;
            country: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            rating: number;
            bio: string | null;
            website: string | null;
            socialLinks: import(".prisma/client/runtime/client").JsonValue | null;
            reviewCount: number;
            totalAds: number;
        } | null;
        ads: {
            id: string;
            userId: string;
            categoryId: string;
            title: string;
            description: string;
            price: number;
            currency: string;
            location: string;
            city: string;
            country: string;
            images: string[];
            status: string;
            isHighlighted: boolean;
            highlightedAt: Date | null;
            views: number;
            condition: string;
            contactPhone: string | null;
            contactWhatsapp: string | null;
            moderationReason: string | null;
            moderatedAt: Date | null;
            moderatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date | null;
        }[];
        subscriptions: ({
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
        reviewsReceived: ({
            reviewer: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            adId: string | null;
            reviewerId: string;
            reviewedUserId: string;
            rating: number;
            comment: string | null;
        })[];
        payments: {
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatar: string | null;
        role: string;
        isActive: boolean;
        isBlocked: boolean;
        blockedReason: string | null;
        blockedUntil: Date | null;
        isVerified: boolean;
        refreshToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        lastLoginAt: Date | null;
    }>;
    blockUser(adminId: string, blockUserDto: BlockUserDto): Promise<{
        message: string;
        user: {
            password: undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            avatar: string | null;
            role: string;
            isActive: boolean;
            isBlocked: boolean;
            blockedReason: string | null;
            blockedUntil: Date | null;
            isVerified: boolean;
            refreshToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            lastLoginAt: Date | null;
        };
    }>;
    unblockUser(adminId: string, userId: string): Promise<{
        message: string;
        user: {
            password: undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            avatar: string | null;
            role: string;
            isActive: boolean;
            isBlocked: boolean;
            blockedReason: string | null;
            blockedUntil: Date | null;
            isVerified: boolean;
            refreshToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            lastLoginAt: Date | null;
        };
    }>;
    verifyUser(adminId: string, userId: string): Promise<{
        message: string;
        user: {
            password: undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            avatar: string | null;
            role: string;
            isActive: boolean;
            isBlocked: boolean;
            blockedReason: string | null;
            blockedUntil: Date | null;
            isVerified: boolean;
            refreshToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            lastLoginAt: Date | null;
        };
    }>;
    changeUserPlan(adminId: string, changeUserPlanDto: {
        userId: string;
        planId: string;
        reason?: string;
    }): Promise<{
        message: string;
        subscription: {
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
        };
    }>;
    getAdsForModeration(status?: string, page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            category: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                slug: string;
                icon: string | null;
                parentId: string | null;
                order: number;
            };
        } & {
            id: string;
            userId: string;
            categoryId: string;
            title: string;
            description: string;
            price: number;
            currency: string;
            location: string;
            city: string;
            country: string;
            images: string[];
            status: string;
            isHighlighted: boolean;
            highlightedAt: Date | null;
            views: number;
            condition: string;
            contactPhone: string | null;
            contactWhatsapp: string | null;
            moderationReason: string | null;
            moderatedAt: Date | null;
            moderatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    moderateAd(adminId: string, moderateAdDto: ModerateAdDto): Promise<{
        message: string;
        ad: {
            id: string;
            userId: string;
            categoryId: string;
            title: string;
            description: string;
            price: number;
            currency: string;
            location: string;
            city: string;
            country: string;
            images: string[];
            status: string;
            isHighlighted: boolean;
            highlightedAt: Date | null;
            views: number;
            condition: string;
            contactPhone: string | null;
            contactWhatsapp: string | null;
            moderationReason: string | null;
            moderatedAt: Date | null;
            moderatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date | null;
        };
    }>;
    removeAd(adminId: string, adId: string, reason: string): Promise<{
        message: string;
        ad: {
            id: string;
            userId: string;
            categoryId: string;
            title: string;
            description: string;
            price: number;
            currency: string;
            location: string;
            city: string;
            country: string;
            images: string[];
            status: string;
            isHighlighted: boolean;
            highlightedAt: Date | null;
            views: number;
            condition: string;
            contactPhone: string | null;
            contactWhatsapp: string | null;
            moderationReason: string | null;
            moderatedAt: Date | null;
            moderatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date | null;
        };
    }>;
    getAllCategories(): Promise<({
        _count: {
            ads: number;
        };
        subcategories: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            slug: string;
            icon: string | null;
            parentId: string | null;
            order: number;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    })[]>;
    createCategory(adminId: string, categoryDto: AdminCategoryDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    updateCategory(adminId: string, categoryId: string, categoryDto: AdminCategoryDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    deleteCategory(adminId: string, categoryId: string): Promise<{
        message: string;
    }>;
    getAllPlans(): Promise<({
        _count: {
            subscriptions: number;
        };
    } & {
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
    })[]>;
    createPlan(adminId: string, planDto: AdminPlanDto): Promise<{
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
    }>;
    updatePlan(adminId: string, planId: string, planDto: AdminPlanDto): Promise<{
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
    }>;
    deactivatePlan(adminId: string, planId: string): Promise<{
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
    }>;
    getFinancialReport(reportDto: FinancialReportDto): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        byMethod: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PaymentGroupByOutputType, "method"[]> & {
            _count: number;
            _sum: {
                amount: number | null;
            };
        })[];
        byPlan: {};
        period: {
            startDate: string | Date;
            endDate: string | Date;
        };
    }>;
    getPayments(page?: number, limit?: number, status?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    createAdminLog(adminId: string, action: string, targetType: string, targetId: string, details: any): Promise<{
        id: string;
        createdAt: Date;
        adminId: string;
        action: string;
        targetType: string;
        targetId: string;
        details: string | null;
    }>;
    getAdminLogs(page?: number, limit?: number): Promise<{
        data: ({
            admin: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            adminId: string;
            action: string;
            targetType: string;
            targetId: string;
            details: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getPendingReports(page?: number, limit?: number): Promise<{
        data: ({
            reporter: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            reporterId: string;
            reportedUserId: string | null;
            reportedAdId: string | null;
            reason: string;
            resolution: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    resolveReport(adminId: string, reportId: string, resolution: string, action: 'approve' | 'dismiss'): Promise<{
        message: string;
        report: {
            id: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            reporterId: string;
            reportedUserId: string | null;
            reportedAdId: string | null;
            reason: string;
            resolution: string | null;
        };
    }>;
}
