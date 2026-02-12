import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { UpgradePlanDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de subscrições
 * Endpoints: /subscriptions
 */
@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  /**
   * Obtém subscrição ativa
   * GET /subscriptions/active
   */
  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter subscrição ativa' })
  async getActiveSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getActiveSubscription(user.userId);
  }

  /**
   * Obtém histórico de subscrições
   * GET /subscriptions/history
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter histórico de subscrições' })
  async getSubscriptionHistory(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.subscriptionsService.getSubscriptionHistory(user.userId, page, limit);
  }

  /**
   * Faz upgrade de plano
   * POST /subscriptions/upgrade
   */
  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer upgrade de plano' })
  async upgradePlan(
    @CurrentUser() user: any,
    @Body() upgradePlanDto: UpgradePlanDto,
  ) {
    return this.subscriptionsService.upgradePlan(user.userId, upgradePlanDto);
  }

  /**
   * Cancela subscrição
   * POST /subscriptions/cancel
   */
  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar subscrição' })
  async cancelSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.userId);
  }

  /**
   * Renova subscrição
   * POST /subscriptions/renew
   */
  @Post('renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar subscrição' })
  async renewSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.renewSubscription(user.userId);
  }

  /**
   * Obtém limite de anúncios
   * GET /subscriptions/limits/ads
   */
  @Get('limits/ads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter limite de anúncios' })
  async getAdsLimit(@CurrentUser() user: any) {
    return this.subscriptionsService.getAdsLimit(user.userId);
  }

  /**
   * Obtém limite de destaques
   * GET /subscriptions/limits/highlights
   */
  @Get('limits/highlights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter limite de destaques' })
  async getHighlightsLimit(@CurrentUser() user: any) {
    return this.subscriptionsService.getHighlightsLimit(user.userId);
  }
}
