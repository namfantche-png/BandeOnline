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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let SubscriptionsService = class SubscriptionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getActiveSubscription(userId) {
        const subscription = await this.db.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
            include: {
                plan: true,
            },
        });
        if (!subscription) {
            const freePlan = await this.db.plan.findFirst({
                where: { name: 'FREE' },
            });
            return {
                id: `free-${userId}`,
                userId,
                planId: freePlan?.id,
                plan: freePlan || {
                    id: 'free-plan',
                    name: 'FREE',
                    description: 'Plano Free',
                    price: 0,
                    currency: 'XOF',
                    features: [],
                    maxAds: 3,
                    maxImages: 3,
                    maxHighlights: 0,
                    hasStore: false,
                    adDuration: 30,
                    duration: null,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                status: 'active',
                startDate: new Date(),
                endDate: null,
                autoRenewal: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
        return subscription;
    }
    async getSubscriptionHistory(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [subscriptions, total] = await Promise.all([
            this.db.subscription.findMany({
                where: { userId },
                include: { plan: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.subscription.count({ where: { userId } }),
        ]);
        return {
            data: subscriptions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async upgradePlan(userId, upgradePlanDto) {
        const { planId } = upgradePlanDto;
        const plan = await this.db.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        const currentSubscription = await this.db.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
            include: {
                plan: true,
            },
        });
        if (!currentSubscription) {
            throw new common_1.BadRequestException('Usuário sem subscrição ativa');
        }
        if (plan.price <= currentSubscription.plan.price) {
            throw new common_1.BadRequestException('Selecione um plano com preço maior para fazer upgrade');
        }
        await this.db.subscription.update({
            where: { id: currentSubscription.id },
            data: { status: 'cancelled' },
        });
        const newSubscription = await this.db.subscription.create({
            data: {
                userId,
                planId,
                status: 'active',
                autoRenew: true,
            },
            include: {
                plan: true,
            },
        });
        return newSubscription;
    }
    async cancelSubscription(userId) {
        const subscription = await this.db.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Nenhuma subscrição ativa para cancelar');
        }
        return this.db.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'cancelled',
                endDate: new Date(),
            },
        });
    }
    async renewSubscription(userId) {
        const subscription = await this.db.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
            include: {
                plan: true,
            },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Nenhuma subscrição ativa para renovar');
        }
        const renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 30);
        return this.db.subscription.update({
            where: { id: subscription.id },
            data: {
                renewalDate,
                autoRenew: true,
            },
        });
    }
    async canCreateAd(userId) {
        const subscription = await this.db.subscription.findFirst({
            where: {
                userId,
                status: 'active',
            },
            include: {
                plan: true,
            },
        });
        if (!subscription) {
            return false;
        }
        const adsCount = await this.db.ad.count({
            where: {
                userId,
                status: 'active',
            },
        });
        return adsCount < subscription.plan.maxAds;
    }
    async getAdsLimit(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const used = await this.db.ad.count({
            where: {
                userId,
                status: 'active',
            },
        });
        return {
            used,
            max: subscription.plan.maxAds,
        };
    }
    async getHighlightsLimit(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const used = await this.db.ad.count({
            where: {
                userId,
                isHighlighted: true,
            },
        });
        return {
            used,
            max: subscription.plan.maxHighlights,
        };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map