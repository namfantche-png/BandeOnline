import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/report.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de denúncias
 * Endpoints: /reports
 */
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  /**
   * Cria denúncia
   * POST /reports
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar denúncia' })
  async createReport(
    @CurrentUser() user: any,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.createReport(user.userId, createReportDto);
  }

  /**
   * Obtém denúncias (admin)
   * GET /reports
   */
  @Get()
  @ApiOperation({ summary: 'Obter denúncias (admin)' })
  async getReports(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.reportsService.getReports(status, page, limit);
  }

  /**
   * Obtém denúncias pendentes (admin)
   * GET /reports/pending
   */
  @Get('pending')
  @ApiOperation({ summary: 'Obter denúncias pendentes (admin)' })
  async getPendingReports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.reportsService.getPendingReports(page, limit);
  }

  /**
   * Obtém denúncia por ID
   * GET /reports/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obter denúncia por ID' })
  async getReportById(@Param('id') reportId: string) {
    return this.reportsService.getReportById(reportId);
  }

  /**
   * Aprova denúncia (admin)
   * POST /reports/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprovar denúncia (admin)' })
  async approveReport(
    @Param('id') reportId: string,
    @Body('resolution') resolution: string,
  ) {
    return this.reportsService.approveReport(reportId, resolution);
  }

  /**
   * Rejeita denúncia (admin)
   * POST /reports/:id/dismiss
   */
  @Post(':id/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeitar denúncia (admin)' })
  async dismissReport(
    @Param('id') reportId: string,
    @Body('resolution') resolution: string,
  ) {
    return this.reportsService.dismissReport(reportId, resolution);
  }
}
