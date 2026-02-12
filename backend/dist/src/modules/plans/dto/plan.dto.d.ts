export declare class CreatePlanDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    maxAds: number;
    maxHighlights: number;
    hasStore: boolean;
    features?: string[];
}
export declare class PlanResponseDto {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    maxAds: number;
    maxHighlights: number;
    hasStore: boolean;
    features: string[];
}
