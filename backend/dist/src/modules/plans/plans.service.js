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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let PlansService = class PlansService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createPlan(createPlanDto) {
        return this.db.plan.create({
            data: {
                name: createPlanDto.name,
                description: createPlanDto.description,
                price: createPlanDto.price,
                currency: createPlanDto.currency || 'XOF',
                maxAds: createPlanDto.maxAds,
                maxHighlights: createPlanDto.maxHighlights,
                hasStore: createPlanDto.hasStore,
                features: createPlanDto.features || [],
            },
        });
    }
    async getAllPlans() {
        return this.db.plan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }
    async getPlanById(planId) {
        const plan = await this.db.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        return plan;
    }
    async getPlanByName(name) {
        const plan = await this.db.plan.findUnique({
            where: { name },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
        return plan;
    }
    async updatePlan(planId, updatePlanDto) {
        return this.db.plan.update({
            where: { id: planId },
            data: {
                name: updatePlanDto.name,
                description: updatePlanDto.description,
                price: updatePlanDto.price,
                currency: updatePlanDto.currency,
                maxAds: updatePlanDto.maxAds,
                maxHighlights: updatePlanDto.maxHighlights,
                hasStore: updatePlanDto.hasStore,
                features: updatePlanDto.features,
            },
        });
    }
    async deactivatePlan(planId) {
        return this.db.plan.update({
            where: { id: planId },
            data: { isActive: false },
        });
    }
    async initializeDefaultPlans() {
        const existingPlans = await this.db.plan.count();
        if (existingPlans > 0) {
            return;
        }
        const defaultPlans = [
            {
                name: 'FREE',
                description: 'Plano gratuito com funcionalidades básicas',
                price: 0,
                currency: 'XOF',
                maxAds: 3,
                maxHighlights: 0,
                hasStore: false,
                features: ['Criar até 3 anúncios', 'Sem destaques', 'Chat com compradores', 'Perfil básico'],
            },
            {
                name: 'PRO',
                description: 'Plano profissional para vendedores ativos',
                price: 5000,
                currency: 'XOF',
                maxAds: 20,
                maxHighlights: 1,
                hasStore: false,
                features: [
                    'Criar até 20 anúncios',
                    '1 anúncio em destaque',
                    'Chat prioritário',
                    'Estatísticas de visualizações',
                ],
            },
            {
                name: 'PREMIUM',
                description: 'Plano premium com todas as funcionalidades',
                price: 15000,
                currency: 'XOF',
                maxAds: 999,
                maxHighlights: 999,
                hasStore: true,
                features: [
                    'Anúncios ilimitados',
                    'Destaques ilimitados',
                    'Loja virtual',
                    'Chat prioritário',
                    'Estatísticas avançadas',
                    'Suporte dedicado',
                ],
            },
        ];
        for (const plan of defaultPlans) {
            await this.db.plan.create({ data: plan });
        }
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], PlansService);
//# sourceMappingURL=plans.service.js.map