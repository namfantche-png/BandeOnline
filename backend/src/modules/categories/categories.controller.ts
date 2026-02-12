import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { AdminGuard } from '../../guards/admin.guard';

/**
 * Controlador de categorias
 * Endpoints: /categories
 * 
 * Permissões:
 * - GET: Público (qualquer pessoa)
 * - POST, PUT: Admin only
 */
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  /**
   * Lista todas as categorias
   * GET /categories
   * Acesso: Público
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  /**
   * Obtém categoria por ID
   * GET /categories/:id
   * Acesso: Público
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  async getCategoryById(@Param('id') categoryId: string) {
    return this.categoriesService.getCategoryById(categoryId);
  }

  /**
   * Cria nova categoria
   * POST /categories
   * Acesso: Admin only
   * Requer: JWT Token + Admin Role
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Criar nova categoria (admin)' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  /**
   * Atualiza categoria
   * PUT /categories/:id
   * Acesso: Admin only
   * Requer: JWT Token + Admin Role
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Atualizar categoria (admin)' })
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(categoryId, updateCategoryDto);
  }
}
