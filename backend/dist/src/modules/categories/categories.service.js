"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let CategoriesService = class CategoriesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getAllCategories() {
        return this.db.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getCategoryById(categoryId) {
        const category = await this.db.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return category;
    }
    async getCategoryBySlug(slug) {
        const category = await this.db.category.findUnique({
            where: { slug },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return category;
    }
    async createCategory(createCategoryDto) {
        const existingCategory = await this.db.category.findFirst({
            where: {
                OR: [
                    { name: createCategoryDto.name },
                    { slug: createCategoryDto.slug },
                ],
            },
        });
        if (existingCategory) {
            throw new common_1.BadRequestException('Categoria já existe');
        }
        return this.db.category.create({
            data: {
                name: createCategoryDto.name,
                slug: createCategoryDto.slug,
                description: createCategoryDto.description,
                icon: createCategoryDto.icon,
            },
        });
    }
    async updateCategory(categoryId, updateCategoryDto) {
        return this.db.category.update({
            where: { id: categoryId },
            data: {
                name: updateCategoryDto.name,
                slug: updateCategoryDto.slug,
                description: updateCategoryDto.description,
                icon: updateCategoryDto.icon,
            },
        });
    }
    async deactivateCategory(categoryId) {
        return this.db.category.update({
            where: { id: categoryId },
            data: { isActive: false },
        });
    }
    async initializeDefaultCategories() {
        const existingCategories = await this.db.category.count();
        if (existingCategories > 0) {
            return;
        }
        const defaultCategories = [
            {
                name: 'Eletrônicos',
                slug: 'eletronicos',
                description: 'Telefones, computadores, tablets e acessórios',
            },
            {
                name: 'Imóveis',
                slug: 'imoveis',
                description: 'Casas, apartamentos e terrenos',
            },
            {
                name: 'Veículos',
                slug: 'veiculos',
                description: 'Carros, motos e bicicletas',
            },
            {
                name: 'Moda',
                slug: 'moda',
                description: 'Roupas, sapatos e acessórios',
            },
            {
                name: 'Móveis',
                slug: 'moveis',
                description: 'Sofás, mesas, cadeiras e outros móveis',
            },
            {
                name: 'Livros',
                slug: 'livros',
                description: 'Livros e materiais educativos',
            },
            {
                name: 'Esportes',
                slug: 'esportes',
                description: 'Equipamentos e artigos esportivos',
            },
            {
                name: 'Beleza',
                slug: 'beleza',
                description: 'Cosméticos e produtos de beleza',
            },
            {
                name: 'Serviços',
                slug: 'servicos',
                description: 'Serviços profissionais diversos',
            },
            {
                name: 'Outros',
                slug: 'outros',
                description: 'Outros produtos e serviços',
            },
        ];
        for (const category of defaultCategories) {
            await this.db.category.create({ data: category });
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map