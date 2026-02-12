import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';

/**
 * Serviço de faturas
 * Gerencia geração e consulta de faturas/recibos
 */
@Injectable()
export class InvoicesService {
  constructor(private db: DatabaseService) {}

  /**
   * Gera fatura para um pagamento
   */
  async generateInvoice(paymentId: string) {
    const payment = await this.db.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Pagamento não foi concluído');
    }

    // Verifica se já existe fatura
    const existingInvoice = await this.db.invoice.findUnique({
      where: { paymentId },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Gera número da fatura
    const invoiceNumber = await this.generateInvoiceNumber();

    // Cria fatura
    const invoice = await this.db.invoice.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        invoiceNumber,
        amount: payment.amount,
        currency: payment.currency,
        status: 'paid',
        description: payment.description || 'Pagamento de subscrição BissauMarket',
        paidAt: payment.updatedAt,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    return invoice;
  }

  /**
   * Gera número único de fatura
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BM-${year}`;

    // Busca última fatura do ano
    const lastInvoice = await this.db.invoice.findFirst({
      where: {
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(5, '0')}`;
  }

  /**
   * Obtém fatura por ID
   */
  async getInvoiceById(invoiceId: string, userId?: string) {
    const where: any = { id: invoiceId };
    if (userId) where.userId = userId;

    const invoice = await this.db.invoice.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    return invoice;
  }

  /**
   * Obtém fatura por número
   */
  async getInvoiceByNumber(invoiceNumber: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    return invoice;
  }

  /**
   * Lista faturas do usuário
   */
  async getUserInvoices(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.db.invoice.findMany({
        where: { userId },
        include: {
          payment: {
            select: {
              method: true,
              provider: true,
              transactionId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.invoice.count({ where: { userId } }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gera dados para PDF da fatura
   */
  async getInvoiceForPdf(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);

    return {
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      paidAt: invoice.paidAt,
      status: invoice.status,
      customer: {
        name: `${invoice.user.firstName} ${invoice.user.lastName}`,
        email: invoice.user.email,
        phone: invoice.user.phone,
      },
      items: [
        {
          description: invoice.description,
          quantity: 1,
          unitPrice: invoice.amount,
          total: invoice.amount,
        },
      ],
      subtotal: invoice.amount,
      tax: 0, // Sem impostos por enquanto
      total: invoice.amount,
      currency: invoice.currency,
      company: {
        name: 'BissauMarket',
        address: 'Bissau, Guiné-Bissau',
        email: 'suporte@bissaumarket.com',
        phone: '+245 XXX XXX XXX',
        website: 'www.bissaumarket.com',
      },
      paymentMethod: invoice.payment?.method || 'mobile_money',
      transactionId: invoice.payment?.transactionId,
    };
  }

  /**
   * Lista todas as faturas (admin)
   */
  async getAllInvoices(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      this.db.invoice.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          payment: {
            select: {
              method: true,
              provider: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
