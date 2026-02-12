import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/plan.dto';

/**
 * Controlador de planos
 * Endpoints: /plans
 */
@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  /**
   * Lista todos os planos
   * GET /plans
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos os planos' })
  async getAllPlans() {
    return this.plansService.getAllPlans();
  }

  /**
   * Obtém plano por ID
   * GET /plans/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter plano por ID' })
  async getPlanById(@Param('id') planId: string) {
    return this.plansService.getPlanById(planId);
  }

  /**
   * Cria novo plano (admin only)
   * POST /plans
   */
  @Post()
  @ApiOperation({ summary: 'Criar novo plano (admin)' })
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.createPlan(createPlanDto);
  }

  /**
   * Atualiza plano (admin only)
   * PUT /plans/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar plano (admin)' })
  async updatePlan(
    @Param('id') planId: string,
    @Body() updatePlanDto: CreatePlanDto,
  ) {
    return this.plansService.updatePlan(planId, updatePlanDto);
  }
}
