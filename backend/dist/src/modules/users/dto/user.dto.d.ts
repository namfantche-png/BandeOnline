export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    city?: string;
    country?: string;
    website?: string;
}
export declare class UserProfileResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    profile: {
        bio?: string;
        location?: string;
        city?: string;
        country?: string;
        rating: number;
        reviewCount: number;
        totalAds: number;
    };
}
