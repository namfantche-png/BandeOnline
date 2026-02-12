import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  FilterUsersDto,
  BlockUserDto,
  ModerateAdDto,
  AdminCategoryDto,
  AdminPlanDto,
  FinancialReportDto,
  ChangeUserPlanDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de administração
 * Endpoints: /admin
 * Todas as rotas requerem autenticação de admin
 */
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================

  /**
   * Obtém estatísticas do dashboard
   * GET /admin/dashboard
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Obtém gráfico de crescimento
   * GET /admin/dashboard/growth
   */
  @Get('dashboard/growth')
  @ApiOperation({ summary: 'Obter gráfico de crescimento' })
  async getGrowthChart(@Query('days') days: number = 30) {
    return this.adminService.getGrowthChart(days);
  }

  // ==========================================
  // GESTÃO DE USUÁRIOS
  // ==========================================

  /**
   * Lista usuários
   * GET /admin/users
   */
  @Get('users')
  @ApiOperation({ summary: 'Listar usuários' })
  async getUsers(@Query() filters: FilterUsersDto) {
    return this.adminService.getUsers(filters);
  }

  /**
   * Obtém detalhes de um usuário
   * GET /admin/users/:id
   */
  @Get('users/:id')
  @ApiOperation({ summary: 'Obter detalhes de usuário' })
  async getUserDetails(@Param('id') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  /**
   * Bloqueia usuário
   * POST /admin/users/block
   */
  @Post('users/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bloquear usuário' })
  async blockUser(@CurrentUser() admin: any, @Body() blockUserDto: BlockUserDto) {
    return this.adminService.blockUser(admin.userId, blockUserDto);
  }

  /**
   * Desbloqueia usuário
   * POST /admin/users/:id/unblock
   */
  @Post('users/:id/unblock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desbloquear usuário' })
  async unblockUser(@CurrentUser() admin: any, @Param('id') userId: string) {
    return this.adminService.unblockUser(admin.userId, userId);
  }

  /**
   * Verifica conta de usuário
   * POST /admin/users/:id/verify
   */
  @Post('users/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar conta de usuário' })
  async verifyUser(@CurrentUser() admin: any, @Param('id') userId: string) {
    return this.adminService.verifyUser(admin.userId, userId);
  }

  /**
   * Altera plano de um usuário
   * POST /admin/users/:id/change-plan
   */
  @Post('users/:id/change-plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar plano de usuário' })
  async changeUserPlan(
    @CurrentUser() admin: any,
    @Param('id') userId: string,
    @Body() changeUserPlanDto: any,
  ) {
    return this.adminService.changeUserPlan(admin.userId, {
      userId,
      planId: changeUserPlanDto.planId,
      reason: changeUserPlanDto.reason,
    });
  }

  // ==========================================
  // MODERAÇÃO DE ANÚNCIOS
  // ==========================================

  /**
   * Lista anúncios para moderação
   * GET /admin/ads
   */
  @Get('ads')
  @ApiOperation({ summary: 'Listar anúncios para moderação' })
  async getAdsForModeration(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getAdsForModeration(status, page, limit);
  }

  /**
   * Modera anúncio
   * POST /admin/ads/moderate
   */
  @Post('ads/moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Moderar anúncio (aprovar/rejeitar)' })
  async moderateAd(@CurrentUser() admin: any, @Body() moderateAdDto: ModerateAdDto) {
    return this.adminService.moderateAd(admin.userId, moderateAdDto);
  }

  /**
   * Remove anúncio
   * DELETE /admin/ads/:id
   */
  @Delete('ads/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover anúncio' })
  async removeAd(
    @CurrentUser() admin: any,
    @Param('id') adId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.removeAd(admin.userId, adId, reason);
  }

  // ==========================================
  // GESTÃO DE CATEGORIAS
  // ==========================================

  /**
   * Lista categorias
   * GET /admin/categories
   */
  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias' })
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  /**
   * Cria categoria
   * POST /admin/categories
   */
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar categoria' })
  async createCategory(@CurrentUser() admin: any, @Body() categoryDto: AdminCategoryDto) {
    return this.adminService.createCategory(admin.userId, categoryDto);
  }

  /**
   * Atualiza categoria
   * PUT /admin/categories/:id
   */
  @Put('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar categoria' })
  async updateCategory(
    @CurrentUser() admin: any,
    @Param('id') categoryId: string,
    @Body() categoryDto: AdminCategoryDto,
  ) {
    return this.adminService.updateCategory(admin.userId, categoryId, categoryDto);
  }

  /**
   * Deleta categoria
   * DELETE /admin/categories/:id
   */
  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar categoria' })
  async deleteCategory(@CurrentUser() admin: any, @Param('id') categoryId: string) {
    return this.adminService.deleteCategory(admin.userId, categoryId);
  }

  // ==========================================
  // GESTÃO DE PLANOS
  // ==========================================

  /**
   * Lista planos
   * GET /admin/plans
   */
  @Get('plans')
  @ApiOperation({ summary: 'Listar planos' })
  async getAllPlans() {
    return this.adminService.getAllPlans();
  }

  /**
   * Cria plano
   * POST /admin/plans
   */
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar plano' })
  async createPlan(@CurrentUser() admin: any, @Body() planDto: AdminPlanDto) {
    return this.adminService.createPlan(admin.userId, planDto);
  }

  /**
   * Atualiza plano
   * PUT /admin/plans/:id
   */
  @Put('plans/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar plano' })
  async updatePlan(
    @CurrentUser() admin: any,
    @Param('id') planId: string,
    @Body() planDto: AdminPlanDto,
  ) {
    return this.adminService.updatePlan(admin.userId, planId, planDto);
  }

  /**
   * Desativa plano
   * POST /admin/plans/:id/deactivate
   */
  @Post('plans/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativar plano' })
  async deactivatePlan(@CurrentUser() admin: any, @Param('id') planId: string) {
    return this.adminService.deactivatePlan(admin.userId, planId);
  }

  // ==========================================
  // RELATÓRIOS FINANCEIROS
  // ==========================================

  /**
   * Obtém relatório financeiro
   * GET /admin/reports/financial
   */
  @Get('reports/financial')
  @ApiOperation({ summary: 'Obter relatório financeiro' })
  async getFinancialReport(@Query() reportDto: FinancialReportDto) {
    return this.adminService.getFinancialReport(reportDto);
  }

  /**
   * Lista pagamentos
   * GET /admin/payments
   */
  @Get('payments')
  @ApiOperation({ summary: 'Listar pagamentos' })
  async getPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayments(page, limit, status);
  }

  // ==========================================
  // DENÚNCIAS
  // ==========================================

  /**
   * Lista denúncias pendentes
   * GET /admin/reports/pending
   */
  @Get('reports/pending')
  @ApiOperation({ summary: 'Listar denúncias pendentes' })
  async getPendingReports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getPendingReports(page, limit);
  }

  /**
   * Resolve denúncia
   * POST /admin/reports/:id/resolve
   */
  @Post('reports/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolver denúncia' })
  async resolveReport(
    @CurrentUser() admin: any,
    @Param('id') reportId: string,
    @Body('resolution') resolution: string,
    @Body('action') action: 'approve' | 'dismiss',
  ) {
    return this.adminService.resolveReport(admin.userId, reportId, resolution, action);
  }

  // ==========================================
  // LOGS
  // ==========================================

  /**
   * Lista logs de administração
   * GET /admin/logs
   */
  @Get('logs')
  @ApiOperation({ summary: 'Listar logs de administração' })
  async getAdminLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.getAdminLogs(page, limit);
  }
}
