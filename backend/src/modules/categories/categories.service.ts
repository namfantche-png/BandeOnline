import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { CreateCategoryDto } from './dto/category.dto';

/**
 * Serviço de categorias
 * Gerencia categorias de anúncios
 */
@Injectable()
export class CategoriesService {
  constructor(private db: DatabaseService) {}

  /**
   * Lista todas as categorias
   */
  async getAllCategories() {
    return this.db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtém categoria por ID
   */
  async getCategoryById(categoryId: string) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Obtém categoria por slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await this.db.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Cria nova categoria (admin only)
   */
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.db.category.findFirst({
      where: {
        OR: [
          { name: createCategoryDto.name },
          { slug: createCategoryDto.slug },
        ],
      },
    });

    if (existingCategory) {
      throw new BadRequestException('Categoria já existe');
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

  /**
   * Atualiza categoria (admin only)
   */
  async updateCategory(
    categoryId: string,
    updateCategoryDto: CreateCategoryDto,
  ) {
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

  /**
   * Desativa categoria (admin only)
   */
  async deactivateCategory(categoryId: string) {
    return this.db.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
  }

  /**
   * Inicializa categorias padrão
   */
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
}
