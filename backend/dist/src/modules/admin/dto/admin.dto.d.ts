export declare enum UserStatus {
    ACTIVE = "active",
    BLOCKED = "blocked",
    SUSPENDED = "suspended",
    PENDING = "pending"
}
export declare enum AdModerationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged"
}
export declare class FilterUsersDto {
    search?: string;
    status?: UserStatus;
    planId?: string;
    page?: number;
    limit?: number;
}
export declare class BlockUserDto {
    userId: string;
    reason: string;
    durationDays?: number;
}
export declare class ModerateAdDto {
    adId: string;
    status: AdModerationStatus;
    reason?: string;
}
export declare class AdminCategoryDto {
    name: string;
    description?: string;
    icon?: string;
    parentId?: string;
    isActive?: boolean;
    order?: number;
}
export declare class AdminPlanDto {
    name: string;
    price: number;
    currency?: string;
    maxAds: number;
    maxHighlights: number;
    maxImages: number;
    hasStore: boolean;
    isActive?: boolean;
    description?: string;
}
export declare class FinancialReportDto {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'week' | 'month';
}
export declare class AdminLogDto {
    action: string;
    targetType: string;
    targetId: string;
    details?: any;
    adminId: string;
}
export declare class ChangeUserPlanDto {
    userId: string;
    planId: string;
    reason?: string;
}
export declare class DashboardStatsDto {
    totalUsers: number;
    activeUsers: number;
    totalAds: number;
    activeAds: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingReports: number;
    pendingAds: number;
}
