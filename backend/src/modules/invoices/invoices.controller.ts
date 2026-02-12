import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

/**
 * Controlador de faturas
 * Endpoints: /invoices
 */
@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  /**
   * Lista faturas do usuário
   * GET /invoices
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar minhas faturas' })
  async getUserInvoices(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.invoicesService.getUserInvoices(user.userId, page, limit);
  }

  /**
   * Obtém fatura por ID
   * GET /invoices/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter fatura por ID' })
  async getInvoiceById(
    @CurrentUser() user: any,
    @Param('id') invoiceId: string,
  ) {
    return this.invoicesService.getInvoiceById(invoiceId, user.userId);
  }

  /**
   * Obtém fatura por número
   * GET /invoices/number/:number
   */
  @Get('number/:number')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter fatura por número' })
  async getInvoiceByNumber(@Param('number') invoiceNumber: string) {
    return this.invoicesService.getInvoiceByNumber(invoiceNumber);
  }

  /**
   * Gera fatura para pagamento
   * POST /invoices/generate/:paymentId
   */
  @Post('generate/:paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gerar fatura para pagamento' })
  async generateInvoice(@Param('paymentId') paymentId: string) {
    return this.invoicesService.generateInvoice(paymentId);
  }

  /**
   * Obtém dados para PDF
   * GET /invoices/:id/pdf
   */
  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados para PDF da fatura' })
  async getInvoiceForPdf(@Param('id') invoiceId: string) {
    return this.invoicesService.getInvoiceForPdf(invoiceId);
  }
}
