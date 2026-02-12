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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let ReviewsService = class ReviewsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createReview(reviewerId, createReviewDto) {
        const { reviewedUserId, rating, comment, adId } = createReviewDto;
        if (reviewerId === reviewedUserId) {
            throw new common_1.BadRequestException('Você não pode avaliar a si mesmo');
        }
        const reviewedUser = await this.db.user.findUnique({
            where: { id: reviewedUserId },
        });
        if (!reviewedUser) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        if (adId) {
            const ad = await this.db.ad.findUnique({
                where: { id: adId },
            });
            if (!ad) {
                throw new common_1.NotFoundException('Anúncio não encontrado');
            }
            const existingReview = await this.db.review.findFirst({
                where: {
                    reviewerId,
                    reviewedUserId,
                    adId,
                },
            });
            if (existingReview) {
                throw new common_1.ConflictException('Você já avaliou este vendedor para este anúncio');
            }
        }
        const review = await this.db.review.create({
            data: {
                reviewerId,
                reviewedUserId,
                rating,
                comment,
                adId,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        await this.updateUserRating(reviewedUserId);
        return review;
    }
    async getReviewsForUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.db.review.findMany({
                where: { reviewedUserId: userId },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    ad: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.review.count({ where: { reviewedUserId: userId } }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getReviewsByUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.db.review.findMany({
                where: { reviewerId: userId },
                include: {
                    reviewedUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    ad: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.review.count({ where: { reviewerId: userId } }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getReviewStats(userId) {
        const reviews = await this.db.review.findMany({
            where: { reviewedUserId: userId },
            select: { rating: true },
        });
        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = Math.round((sum / reviews.length) * 10) / 10;
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            ratingDistribution[r.rating]++;
        });
        return {
            averageRating,
            totalReviews: reviews.length,
            ratingDistribution,
        };
    }
    async getReviewById(reviewId) {
        const review = await this.db.review.findUnique({
            where: { id: reviewId },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                reviewedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                ad: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        if (!review) {
            throw new common_1.NotFoundException('Avaliação não encontrada');
        }
        return review;
    }
    async updateReview(reviewId, reviewerId, updateReviewDto) {
        const review = await this.db.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Avaliação não encontrada');
        }
        if (review.reviewerId !== reviewerId) {
            throw new common_1.BadRequestException('Você não tem permissão para editar esta avaliação');
        }
        const updatedReview = await this.db.review.update({
            where: { id: reviewId },
            data: updateReviewDto,
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        await this.updateUserRating(review.reviewedUserId);
        return updatedReview;
    }
    async deleteReview(reviewId, reviewerId) {
        const review = await this.db.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Avaliação não encontrada');
        }
        if (review.reviewerId !== reviewerId) {
            throw new common_1.BadRequestException('Você não tem permissão para deletar esta avaliação');
        }
        await this.db.review.delete({
            where: { id: reviewId },
        });
        await this.updateUserRating(review.reviewedUserId);
        return { message: 'Avaliação deletada com sucesso' };
    }
    async updateUserRating(userId) {
        const reviews = await this.db.review.findMany({
            where: { reviewedUserId: userId },
            select: { rating: true },
        });
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            averageRating = Math.round((sum / reviews.length) * 10) / 10;
        }
        await this.db.profile.upsert({
            where: { userId },
            update: {
                rating: averageRating,
                reviewCount: reviews.length,
            },
            create: {
                userId,
                rating: averageRating,
                reviewCount: reviews.length,
            },
        });
    }
    async canReview(reviewerId, reviewedUserId) {
        const hasConversation = await this.db.message.findFirst({
            where: {
                OR: [
                    { senderId: reviewerId, receiverId: reviewedUserId },
                    { senderId: reviewedUserId, receiverId: reviewerId },
                ],
            },
        });
        return !!hasConversation;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map