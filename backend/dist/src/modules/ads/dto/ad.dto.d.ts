export declare enum ProductCondition {
    NEW = "new",
    LIKE_NEW = "like_new",
    USED = "used",
    FOR_REPAIR = "for_repair"
}
export declare class CreateAdDto {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    location: string;
    city: string;
    country: string;
    images?: string[];
    condition?: ProductCondition;
    currency?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    subcategoryId?: string;
}
export declare class UpdateAdDto {
    title?: string;
    description?: string;
    price?: number;
    location?: string;
    city?: string;
    country?: string;
    images?: string[];
    condition?: ProductCondition;
    contactPhone?: string;
    contactWhatsapp?: string;
    existingImages?: string[] | string;
}
export declare class AdResponseDto {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: string;
    city: string;
    country: string;
    images: string[];
    condition: string;
    status: string;
    isHighlighted: boolean;
    views: number;
    createdAt: Date;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    category: {
        id: string;
        name: string;
    };
}
