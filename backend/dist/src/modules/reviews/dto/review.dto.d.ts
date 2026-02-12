export declare class CreateReviewDto {
    reviewedUserId: string;
    rating: number;
    comment?: string;
    adId?: string;
}
export declare class UpdateReviewDto {
    rating?: number;
    comment?: string;
}
export declare class ReviewResponseDto {
    id: string;
    reviewerId: string;
    reviewedUserId: string;
    rating: number;
    comment?: string;
    adId?: string;
    createdAt: Date;
    reviewer: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}
export declare class ReviewStatsDto {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}
