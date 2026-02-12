import { DatabaseService } from '../../config/database.config';
import { CreateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private db;
    constructor(db: DatabaseService);
    getAllCategories(): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }[]>;
    getCategoryById(categoryId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    getCategoryBySlug(slug: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    createCategory(createCategoryDto: CreateCategoryDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    updateCategory(categoryId: string, updateCategoryDto: CreateCategoryDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    deactivateCategory(categoryId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
        icon: string | null;
        parentId: string | null;
        order: number;
    }>;
    initializeDefaultCategories(): Promise<void>;
}
