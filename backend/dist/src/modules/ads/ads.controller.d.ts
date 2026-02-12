import { AdsService } from './ads.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
export declare class AdsController {
    private adsService;
    constructor(adsService: AdsService);
    listAds(page?: number, limit?: number, categoryId?: string, city?: string, minPrice?: number, maxPrice?: number, search?: string, featured?: boolean): Promise<{
        data: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
            };
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
    searchAds(query: string, page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
            };
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
    getAdById(adId: string): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
            profile: {
                rating: number;
                reviewCount: number;
            } | null;
        };
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
    }>;
    createAd(user: any, createAdDto: CreateAdDto, files: {
        images?: Express.Multer.File[];
    }): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
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
    }>;
    getUserAds(user: any, page?: number, limit?: number): Promise<{
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
    updateAd(adId: string, user: any, updateAdDto: UpdateAdDto, files: {
        images?: Express.Multer.File[];
    }): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
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
    }>;
    deleteAd(adId: string, user: any): Promise<{
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
    }>;
    highlightAd(adId: string, user: any): Promise<{
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
    }>;
    unhighlightAd(adId: string, user: any): Promise<{
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
    }>;
}
