import { ModuleRef } from '@nestjs/core';
import { DatabaseService } from '../../config/database.config';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
export declare class AdsService {
    private db;
    private plansService;
    private subscriptionsService;
    private moduleRef;
    constructor(db: DatabaseService, plansService: PlansService, subscriptionsService: SubscriptionsService, moduleRef: ModuleRef);
    createAd(userId: string, createAdDto: CreateAdDto, files?: Express.Multer.File[]): Promise<{
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
    updateAd(adId: string, userId: string, updateAdDto: UpdateAdDto, files?: Express.Multer.File[]): Promise<{
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
    deleteAd(adId: string, userId: string): Promise<{
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
    highlightAd(adId: string, userId: string): Promise<{
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
    unhighlightAd(adId: string, userId: string): Promise<{
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
}
