import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(user: any, createReviewDto: CreateReviewDto): Promise<{
        reviewer: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
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
    }>;
    getReviewsForUser(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            ad: {
                id: string;
                title: string;
            } | null;
            reviewer: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getMyReviews(user: any, page?: number, limit?: number): Promise<{
        data: ({
            ad: {
                id: string;
                title: string;
            } | null;
            reviewedUser: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getReviewStats(userId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    }>;
    getReviewById(reviewId: string): Promise<{
        ad: {
            id: string;
            title: string;
        } | null;
        reviewer: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
        reviewedUser: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
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
    }>;
    updateReview(user: any, reviewId: string, updateReviewDto: UpdateReviewDto): Promise<{
        reviewer: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
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
    }>;
    deleteReview(user: any, reviewId: string): Promise<{
        message: string;
    }>;
    canReview(user: any, reviewedUserId: string): Promise<{
        canReview: boolean;
    }>;
}
