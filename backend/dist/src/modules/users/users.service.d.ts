import { DatabaseService } from '../../config/database.config';
import { UpdateProfileDto } from './dto/user.dto';
export declare class UsersService {
    private db;
    constructor(db: DatabaseService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatar: string | null;
        profile: {
            bio: string | null | undefined;
            location: string | null | undefined;
            city: string | null | undefined;
            country: string | null | undefined;
            rating: number;
            reviewCount: number;
            totalAds: number;
        };
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatar: string | null;
        profile: {
            bio: string | null | undefined;
            location: string | null | undefined;
            city: string | null | undefined;
            country: string | null | undefined;
            rating: number;
            reviewCount: number;
            totalAds: number;
        };
    }>;
    getPublicProfile(userId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        profile: {
            bio: string | null | undefined;
            location: string | null | undefined;
            city: string | null | undefined;
            country: string | null | undefined;
            rating: number;
            reviewCount: number;
            totalAds: number;
        };
    }>;
    getUserAdsCount(userId: string): Promise<number>;
    getUserAds(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
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
}
