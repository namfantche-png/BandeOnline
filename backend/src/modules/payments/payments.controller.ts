import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de pagamentos
 * Endpoints: /payments
 */
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Inicia pagamento
   * POST /payments/initiate
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Iniciar pagamento' })
  async initiatePayment(
    @CurrentUser() user: any,
    @Body() initiatePaymentDto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(user.userId, initiatePaymentDto);
  }

  /**
   * Confirma pagamento
   * POST /payments/confirm
   */
  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar pagamento' })
  async confirmPayment(
    @CurrentUser() user: any,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirmPayment(user.userId, confirmPaymentDto);
  }

  /**
   * Obtém histórico de pagamentos
   * GET /payments/history
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter histórico de pagamentos' })
  async getPaymentHistory(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.getPaymentHistory(user.userId, page, limit);
  }

  /**
   * Obtém detalhes de um pagamento
   * GET /payments/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes de pagamento' })
  async getPaymentDetails(
    @CurrentUser() user: any,
    @Param('id') paymentId: string,
  ) {
    return this.paymentsService.getPaymentDetails(paymentId, user.userId);
  }

  /**
   * Webhook de confirmação de pagamento (mock)
   * POST /payments/webhook/confirm
   */
  @Post('webhook/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de confirmação de pagamento' })
  async webhookPaymentConfirmation(@Body('transactionId') transactionId: string) {
    return this.paymentsService.webhookPaymentConfirmation(transactionId);
  }

  /**
   * Estatísticas de pagamento (admin)
   * GET /payments/stats
   */
  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de pagamento (admin)' })
  async getPaymentStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getPaymentStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
