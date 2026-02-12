"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
const admin_dto_1 = require("./dto/admin.dto");
let AdminService = class AdminService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalUsers, activeUsers, totalAds, activeAds, totalRevenue, monthlyRevenue, pendingReports, pendingAds,] = await Promise.all([
            this.db.user.count(),
            this.db.user.count({ where: { isBlocked: false } }),
            this.db.ad.count(),
            this.db.ad.count({ where: { status: 'active' } }),
            this.db.payment.aggregate({
                where: { status: 'completed' },
                _sum: { amount: true },
            }),
            this.db.payment.aggregate({
                where: {
                    status: 'completed',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            this.db.report.count({ where: { status: 'pending' } }),
            this.db.ad.count({ where: { status: 'pending' } }),
        ]);
        return {
            totalUsers,
            activeUsers,
            totalAds,
            activeAds,
            totalRevenue: totalRevenue._sum.amount || 0,
            monthlyRevenue: monthlyRevenue._sum.amount || 0,
            pendingReports,
            pendingAds,
        };
    }
    async getGrowthChart(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const users = await this.db.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        });
        const ads = await this.db.ad.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        });
        return { users, ads };
    }
    async getUsers(filters) {
        const { search, status, planId, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status === admin_dto_1.UserStatus.BLOCKED) {
            where.isBlocked = true;
        }
        else if (status === admin_dto_1.UserStatus.ACTIVE) {
            where.isBlocked = false;
        }
        const [users, total] = await Promise.all([
            this.db.user.findMany({
                where,
                include: {
                    profile: true,
                    subscriptions: {
                        where: { status: 'active' },
                        include: { plan: true },
                        take: 1,
                    },
                    _count: {
                        select: { ads: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.user.count({ where }),
        ]);
        const freePlan = await this.db.plan.findFirst({ where: { name: 'FREE' } });
        return {
            data: users.map((user) => ({
                ...user,
                password: undefined,
                currentPlan: user.subscriptions[0]?.plan || freePlan || { id: '', name: 'FREE', maxAds: 3 },
                adsCount: user._count.ads,
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getUserDetails(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                subscriptions: {
                    include: { plan: true },
                    orderBy: { createdAt: 'desc' },
                },
                ads: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                reviewsReceived: {
                    include: {
                        reviewer: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        return {
            ...user,
            password: undefined,
        };
    }
    async blockUser(adminId, blockUserDto) {
        const { userId, reason, durationDays } = blockUserDto;
        const user = await this.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (user.role === 'admin') {
            throw new common_1.ForbiddenException('Não é possível bloquear um administrador');
        }
        let blockedUntil = null;
        if (durationDays) {
            blockedUntil = new Date();
            blockedUntil.setDate(blockedUntil.getDate() + durationDays);
        }
        const updatedUser = await this.db.user.update({
            where: { id: userId },
            data: {
                isBlocked: true,
                blockedReason: reason,
                blockedUntil,
            },
        });
        await this.createAdminLog(adminId, 'BLOCK_USER', 'user', userId, {
            reason,
            durationDays,
        });
        return {
            message: 'Usuário bloqueado com sucesso',
            user: { ...updatedUser, password: undefined },
        };
    }
    async unblockUser(adminId, userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const updatedUser = await this.db.user.update({
            where: { id: userId },
            data: {
                isBlocked: false,
                blockedReason: null,
                blockedUntil: null,
            },
        });
        await this.createAdminLog(adminId, 'UNBLOCK_USER', 'user', userId, {});
        return {
            message: 'Usuário desbloqueado com sucesso',
            user: { ...updatedUser, password: undefined },
        };
    }
    async verifyUser(adminId, userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const updatedUser = await this.db.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });
        await this.createAdminLog(adminId, 'VERIFY_USER', 'user', userId, {});
        return {
            message: 'Conta verificada com sucesso',
            user: { ...updatedUser, password: undefined },
        };
    }
    async changeUserPlan(adminId, changeUserPlanDto) {
        const { userId, planId, reason } = changeUserPlanDto;
        const user = await this.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const plan = await this.db.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const activeSubscription = await this.db.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
        });
        if (activeSubscription) {
            await this.db.subscription.update({
                where: { id: activeSubscription.id },
                data: { status: 'cancelled' },
            });
        }
        const newSubscription = await this.db.subscription.create({
            data: {
                userId,
                planId,
                status: 'active',
                startDate: new Date(),
                autoRenew: false,
            },
            include: {
                plan: true,
            },
        });
        await this.createAdminLog(adminId, 'CHANGE_USER_PLAN', 'subscription', newSubscription.id, {
            userId,
            oldPlanId: activeSubscription?.planId,
            newPlanId: planId,
            reason,
        });
        return {
            message: `Plano alterado para ${plan.name} com sucesso`,
            subscription: newSubscription,
        };
    }
    async getAdsForModeration(status, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [ads, total] = await Promise.all([
            this.db.ad.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.ad.count({ where }),
        ]);
        return {
            data: ads,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async moderateAd(adminId, moderateAdDto) {
        const { adId, status, reason } = moderateAdDto;
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        const updatedAd = await this.db.ad.update({
            where: { id: adId },
            data: {
                status: status === admin_dto_1.AdModerationStatus.APPROVED ? 'active' : status,
                moderationReason: reason,
                moderatedAt: new Date(),
                moderatedBy: adminId,
            },
        });
        await this.createAdminLog(adminId, 'MODERATE_AD', 'ad', adId, {
            status,
            reason,
        });
        return {
            message: `Anúncio ${status === admin_dto_1.AdModerationStatus.APPROVED ? 'aprovado' : 'rejeitado'} com sucesso`,
            ad: updatedAd,
        };
    }
    async removeAd(adminId, adId, reason) {
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        const updatedAd = await this.db.ad.update({
            where: { id: adId },
            data: {
                status: 'removed',
                moderationReason: reason,
                moderatedAt: new Date(),
                moderatedBy: adminId,
            },
        });
        await this.createAdminLog(adminId, 'REMOVE_AD', 'ad', adId, { reason });
        return {
            message: 'Anúncio removido com sucesso',
            ad: updatedAd,
        };
    }
    async getAllCategories() {
        const categories = await this.db.category.findMany({
            where: { parentId: null },
            include: {
                subcategories: {
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: { ads: true },
                },
            },
            orderBy: { order: 'asc' },
        });
        return categories;
    }
    async createCategory(adminId, categoryDto) {
        const { name, description, icon, parentId, isActive, order } = categoryDto;
        if (parentId) {
            const parent = await this.db.category.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Categoria pai não encontrada');
            }
        }
        const category = await this.db.category.create({
            data: {
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
                description,
                icon,
                parentId: parentId || null,
                isActive: isActive ?? true,
                order: order ?? 0,
            },
        });
        await this.createAdminLog(adminId, 'CREATE_CATEGORY', 'category', category.id, {
            name,
        });
        return category;
    }
    async updateCategory(adminId, categoryId, categoryDto) {
        const category = await this.db.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        const updatedCategory = await this.db.category.update({
            where: { id: categoryId },
            data: categoryDto,
        });
        await this.createAdminLog(adminId, 'UPDATE_CATEGORY', 'category', categoryId, categoryDto);
        return updatedCategory;
    }
    async deleteCategory(adminId, categoryId) {
        const category = await this.db.category.findUnique({
            where: { id: categoryId },
            include: { _count: { select: { ads: true, subcategories: true } } },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        if (category._count.ads > 0) {
            throw new common_1.BadRequestException('Não é possível deletar categoria com anúncios');
        }
        if (category._count.subcategories > 0) {
            throw new common_1.BadRequestException('Não é possível deletar categoria com subcategorias');
        }
        await this.db.category.delete({
            where: { id: categoryId },
        });
        await this.createAdminLog(adminId, 'DELETE_CATEGORY', 'category', categoryId, {});
        return { message: 'Categoria deletada com sucesso' };
    }
    async getAllPlans() {
        const plans = await this.db.plan.findMany({
            include: {
                _count: {
                    select: { subscriptions: true },
                },
            },
            orderBy: { price: 'asc' },
        });
        return plans;
    }
    async createPlan(adminId, planDto) {
        const plan = await this.db.plan.create({
            data: {
                name: planDto.name,
                price: planDto.price,
                currency: planDto.currency || 'XOF',
                maxAds: planDto.maxAds,
                maxHighlights: planDto.maxHighlights,
                maxImages: planDto.maxImages,
                hasStore: planDto.hasStore,
                isActive: planDto.isActive ?? true,
                description: planDto.description,
            },
        });
        await this.createAdminLog(adminId, 'CREATE_PLAN', 'plan', plan.id, planDto);
        return plan;
    }
    async updatePlan(adminId, planId, planDto) {
        const plan = await this.db.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const updatedPlan = await this.db.plan.update({
            where: { id: planId },
            data: planDto,
        });
        await this.createAdminLog(adminId, 'UPDATE_PLAN', 'plan', planId, planDto);
        return updatedPlan;
    }
    async deactivatePlan(adminId, planId) {
        const plan = await this.db.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const updatedPlan = await this.db.plan.update({
            where: { id: planId },
            data: { isActive: false },
        });
        await this.createAdminLog(adminId, 'DEACTIVATE_PLAN', 'plan', planId, {});
        return updatedPlan;
    }
    async getFinancialReport(reportDto) {
        const { startDate, endDate, groupBy } = reportDto;
        const where = { status: 'completed' };
        if (startDate)
            where.createdAt = { gte: startDate };
        if (endDate)
            where.createdAt = { ...where.createdAt, lte: endDate };
        const totalRevenue = await this.db.payment.aggregate({
            where,
            _sum: { amount: true },
            _count: true,
        });
        const byMethod = await this.db.payment.groupBy({
            by: ['method'],
            where,
            _sum: { amount: true },
            _count: true,
        });
        const subscriptions = await this.db.subscription.findMany({
            where: {
                createdAt: where.createdAt,
            },
            include: { plan: true },
        });
        const byPlan = subscriptions.reduce((acc, sub) => {
            const planName = sub.plan?.name || 'Unknown';
            if (!acc[planName]) {
                acc[planName] = { count: 0, revenue: 0 };
            }
            acc[planName].count += 1;
            acc[planName].revenue += sub.plan?.price || 0;
            return acc;
        }, {});
        return {
            totalRevenue: totalRevenue._sum.amount || 0,
            totalTransactions: totalRevenue._count,
            byMethod,
            byPlan,
            period: {
                startDate: startDate || 'all time',
                endDate: endDate || 'now',
            },
        };
    }
    async getPayments(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [payments, total] = await Promise.all([
            this.db.payment.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.payment.count({ where }),
        ]);
        return {
            data: payments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async createAdminLog(adminId, action, targetType, targetId, details) {
        return this.db.adminLog.create({
            data: {
                adminId,
                action,
                targetType,
                targetId,
                details: JSON.stringify(details),
            },
        });
    }
    async getAdminLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.db.adminLog.findMany({
                include: {
                    admin: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.adminLog.count(),
        ]);
        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getPendingReports(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            this.db.report.findMany({
                where: { status: 'pending' },
                include: {
                    reporter: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.report.count({ where: { status: 'pending' } }),
        ]);
        return {
            data: reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async resolveReport(adminId, reportId, resolution, action) {
        const report = await this.db.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Denúncia não encontrada');
        }
        const updatedReport = await this.db.report.update({
            where: { id: reportId },
            data: {
                status: action === 'approve' ? 'resolved' : 'dismissed',
                resolution,
            },
        });
        if (action === 'approve') {
            if (report.reportedUserId) {
                await this.db.user.update({
                    where: { id: report.reportedUserId },
                    data: {
                        isBlocked: true,
                        blockedReason: `Denúncia aprovada: ${resolution}`,
                    },
                });
            }
            if (report.reportedAdId) {
                await this.db.ad.update({
                    where: { id: report.reportedAdId },
                    data: { status: 'removed' },
                });
            }
        }
        await this.createAdminLog(adminId, 'RESOLVE_REPORT', 'report', reportId, {
            action,
            resolution,
        });
        return {
            message: `Denúncia ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`,
            report: updatedReport,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map