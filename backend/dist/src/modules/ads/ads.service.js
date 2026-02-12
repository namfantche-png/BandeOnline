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
exports.AdsService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const database_config_1 = require("../../config/database.config");
const plans_service_1 = require("../plans/plans.service");
const uploads_service_1 = require("../uploads/uploads.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let AdsService = class AdsService {
    db;
    plansService;
    subscriptionsService;
    moduleRef;
    constructor(db, plansService, subscriptionsService, moduleRef) {
        this.db = db;
        this.plansService = plansService;
        this.subscriptionsService = subscriptionsService;
        this.moduleRef = moduleRef;
    }
    async createAd(userId, createAdDto, files = []) {
        try {
            const category = await this.db.category.findUnique({
                where: { id: createAdDto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException('Categoria não encontrada');
            }
            const subscription = await this.subscriptionsService.getActiveSubscription(userId);
            const activeAdsCount = await this.db.ad.count({
                where: {
                    userId,
                    status: 'active',
                },
            });
            if (activeAdsCount >= subscription.plan.maxAds) {
                throw new common_1.BadRequestException(`Limite de ${subscription.plan.maxAds} anúncios atingido. Faça upgrade para criar mais anúncios.`);
            }
            const uploadsService = this.moduleRef.get(uploads_service_1.UploadsService, { strict: false });
            let imageUrls = [];
            if (files && files.length > 0) {
                try {
                    const uploadedImages = await uploadsService.uploadMultipleImages(files, userId, subscription.plan.maxImages, 'ads');
                    imageUrls = uploadedImages.map((img) => img.url);
                }
                catch (uploadError) {
                    console.error('Erro ao fazer upload de imagens:', uploadError);
                    imageUrls = [];
                }
            }
            const ad = await this.db.ad.create({
                data: {
                    userId,
                    categoryId: createAdDto.categoryId,
                    title: createAdDto.title,
                    description: createAdDto.description,
                    price: createAdDto.price,
                    currency: createAdDto.currency || 'XOF',
                    location: createAdDto.location,
                    city: createAdDto.city,
                    country: createAdDto.country,
                    images: imageUrls,
                    condition: createAdDto.condition || 'used',
                    contactPhone: createAdDto.contactPhone || null,
                    contactWhatsapp: createAdDto.contactWhatsapp || null,
                    status: 'active',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return ad;
        }
        catch (error) {
            console.error('Erro em createAd:', error);
            throw error;
        }
    }
    async listAds(page = 1, limit = 20, categoryId, city, minPrice, maxPrice, search, featured) {
        const skip = (page - 1) * limit;
        const whereConditions = [
            { status: 'active' },
        ];
        if (categoryId)
            whereConditions.push({ categoryId });
        if (city)
            whereConditions.push({ city });
        if (minPrice || maxPrice) {
            const priceCondition = {};
            if (minPrice)
                priceCondition.gte = minPrice;
            if (maxPrice)
                priceCondition.lte = maxPrice;
            whereConditions.push({ price: priceCondition });
        }
        if (search) {
            whereConditions.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (featured === true) {
            whereConditions.push({ isHighlighted: true });
        }
        const where = whereConditions.length > 1
            ? { AND: whereConditions }
            : whereConditions[0];
        const [ads, total] = await Promise.all([
            this.db.ad.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: [{ isHighlighted: 'desc' }, { highlightedAt: 'desc' }, { createdAt: 'desc' }],
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
    async getAdById(adId) {
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        profile: {
                            select: {
                                rating: true,
                                reviewCount: true,
                            },
                        },
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        await this.db.ad.update({
            where: { id: adId },
            data: { views: { increment: 1 } },
        });
        return ad;
    }
    async getUserAds(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [ads, total] = await Promise.all([
            this.db.ad.findMany({
                where: { userId },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.ad.count({ where: { userId } }),
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
    async updateAd(adId, userId, updateAdDto, files = []) {
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        if (ad.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para editar este anúncio');
        }
        let imageUrls = [];
        if (updateAdDto.existingImages !== undefined && updateAdDto.existingImages !== null) {
            const raw = updateAdDto.existingImages;
            if (Array.isArray(raw)) {
                imageUrls = raw;
            }
            else if (typeof raw === 'string' && raw.trim()) {
                try {
                    const parsed = JSON.parse(raw);
                    imageUrls = Array.isArray(parsed) ? parsed : [];
                }
                catch {
                    imageUrls = [];
                }
            }
        }
        else {
            imageUrls = [...(ad.images || [])];
        }
        if (files && files.length > 0) {
            try {
                const uploadsService = this.moduleRef.get(uploads_service_1.UploadsService, { strict: false });
                const subscription = await this.subscriptionsService.getActiveSubscription(userId);
                const uploadedImages = await uploadsService.uploadMultipleImages(files, userId, subscription.plan.maxImages, 'ads');
                imageUrls = [...imageUrls, ...uploadedImages.map((img) => img.url)];
                imageUrls = imageUrls.slice(0, subscription.plan.maxImages);
            }
            catch (uploadError) {
                console.error('Erro ao fazer upload de imagens:', uploadError);
            }
        }
        const { existingImages: _existing, ...restDto } = updateAdDto;
        const updateData = {
            ...restDto,
            images: imageUrls.length > 0 ? imageUrls : undefined,
        };
        Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);
        return this.db.ad.update({
            where: { id: adId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async deleteAd(adId, userId) {
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        if (ad.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para remover este anúncio');
        }
        return this.db.ad.update({
            where: { id: adId },
            data: { status: 'removed' },
        });
    }
    async highlightAd(adId, userId) {
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        if (ad.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para destacar este anúncio');
        }
        const subscription = await this.db.subscription.findFirst({
            where: { userId, status: 'active' },
            include: { plan: true },
        });
        const plan = subscription?.plan ?? (await this.db.plan.findFirst({ where: { name: 'FREE' } }));
        const maxHighlights = plan?.maxHighlights ?? 0;
        if (maxHighlights === 0) {
            throw new common_1.BadRequestException('Seu plano não permite destaques');
        }
        const currentHighlighted = await this.db.ad.count({
            where: { userId, isHighlighted: true },
        });
        if (currentHighlighted >= maxHighlights) {
            const oldestHighlighted = await this.db.ad.findFirst({
                where: { userId, isHighlighted: true },
                orderBy: { highlightedAt: 'asc' },
            });
            if (oldestHighlighted && oldestHighlighted.id !== adId) {
                await this.db.ad.update({
                    where: { id: oldestHighlighted.id },
                    data: { isHighlighted: false, highlightedAt: null },
                });
            }
        }
        return this.db.ad.update({
            where: { id: adId },
            data: { isHighlighted: true, highlightedAt: new Date() },
        });
    }
    async unhighlightAd(adId, userId) {
        const ad = await this.db.ad.findUnique({
            where: { id: adId },
        });
        if (!ad) {
            throw new common_1.NotFoundException('Anúncio não encontrado');
        }
        if (ad.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para remover destaque deste anúncio');
        }
        return this.db.ad.update({
            where: { id: adId },
            data: { isHighlighted: false, highlightedAt: null },
        });
    }
    async searchAds(query, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const searchTerm = query.trim().toLowerCase();
        const searchWords = searchTerm.split(/\s+/).filter((word) => word.length > 2);
        const searchConditions = [];
        searchConditions.push({ title: { contains: searchTerm, mode: 'insensitive' } });
        if (searchWords.length > 0) {
            searchConditions.push({
                AND: searchWords.map((word) => ({
                    title: { contains: word, mode: 'insensitive' },
                })),
            });
        }
        searchConditions.push({ description: { contains: searchTerm, mode: 'insensitive' } });
        if (searchWords.length > 0) {
            searchConditions.push({
                AND: searchWords.map((word) => ({
                    description: { contains: word, mode: 'insensitive' },
                })),
            });
        }
        const where = {
            AND: [
                { status: 'active' },
                {
                    OR: searchConditions,
                },
            ],
        };
        const [ads, total] = await Promise.all([
            this.db.ad.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.ad.count({ where }),
        ]);
        const sortedAds = ads.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
            const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
            if (aTitleMatch && !bTitleMatch)
                return -1;
            if (!aTitleMatch && bTitleMatch)
                return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return {
            data: sortedAds,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdsService = AdsService;
exports.AdsService = AdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService,
        plans_service_1.PlansService,
        subscriptions_service_1.SubscriptionsService,
        core_1.ModuleRef])
], AdsService);
//# sourceMappingURL=ads.service.js.map