import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
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
}
