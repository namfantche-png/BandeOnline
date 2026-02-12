import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { InitiatePaymentDto, ConfirmPaymentDto } from './dto/payment.dto';

/**
 * Serviço de pagamentos
 * Gerencia pagamentos e transações
 * 
 * Suporta múltiplos gateways de pagamento:
 * - Mobile Money (Orange Money, MTN Mobile Money)
 * - Cartão de crédito/débito
 * - Transferência bancária
 */
@Injectable()
export class PaymentsService {
  constructor(private db: DatabaseService) {}

  /**
   * Inicia pagamento
   * Cria registro de pagamento e retorna informações para processamento
   */
  async initiatePayment(userId: string, initiatePaymentDto: InitiatePaymentDto) {
    const { amount, currency, method, provider, planId, description } =
      initiatePaymentDto;

    // Verifica se plano existe
    const plan = await this.db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Cria registro de pagamento com status 'pending'
    const payment = await this.db.payment.create({
      data: {
        userId,
        amount,
        currency: currency || 'XOF',
        status: 'pending',
        method,
        provider,
        description: description || `Pagamento para plano ${plan.name}`,
      },
    });

    // Gera transactionId único
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Atualiza payment com transactionId
    await this.db.payment.update({
      where: { id: payment.id },
      data: { transactionId },
    });

    // Determina URL de redirecionamento baseado no provider
    let redirectUrl: string | null = null;
    let message = 'Pagamento iniciado. Confirme a transação no seu dispositivo móvel.';

    if (provider === 'orange_money') {
      redirectUrl = this.getOrangeMoneyUrl(transactionId, amount);
      message = 'Redirecionando para Orange Money...';
    } else if (provider === 'mtn_money') {
      redirectUrl = this.getMTNMobileMoneyUrl(transactionId, amount);
      message = 'Redirecionando para MTN Mobile Money...';
    } else if (method === 'card') {
      redirectUrl = this.getCardPaymentUrl(transactionId, amount);
      message = 'Redirecionando para gateway de pagamento...';
    }

    return {
      paymentId: payment.id,
      transactionId,
      amount,
      currency: currency || 'XOF',
      method,
      provider,
      status: 'pending',
      message,
      redirectUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Expira em 15 minutos
    };
  }

  /**
   * Confirma pagamento
   * Processa confirmação de transação do gateway de pagamento
   */
  async confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto) {
    const { transactionId, paymentId } = confirmPaymentDto;

    // Busca pagamento
    const payment = await this.db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Pagamento não pertence ao usuário');
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException('Pagamento já foi processado');
    }

    // Verifica se pagamento não expirou
    const paymentAge = Date.now() - new Date(payment.createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    if (paymentAge > fifteenMinutes) {
      await this.db.payment.update({
        where: { id: paymentId },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Pagamento expirado. Inicie um novo pagamento.');
    }

    // Em produção, aqui verificaria com o gateway de pagamento
    // Por enquanto, simula verificação (90% de sucesso)
    const isSuccessful = process.env.NODE_ENV === 'production' 
      ? await this.verifyPaymentWithGateway(transactionId, payment.provider || 'orange_money')
      : Math.random() > 0.1;

    if (!isSuccessful) {
      // Falha no pagamento
      await this.db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          transactionId,
          failureReason: 'Falha na verificação do gateway de pagamento',
        } as any,
      });

      throw new BadRequestException('Falha ao processar pagamento. Tente novamente.');
    }

    // Sucesso no pagamento
    const updatedPayment = await this.db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        transactionId,
        completedAt: new Date(),
      } as any,
    });

    return {
      id: updatedPayment.id,
      status: 'completed',
      transactionId,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      message: 'Pagamento processado com sucesso!',
    };
  }

  /**
   * Obtém histórico de pagamentos do usuário
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém detalhes de um pagamento
   */
  async getPaymentDetails(paymentId: string, userId: string) {
    const payment = await this.db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Acesso negado');
    }

    return payment;
  }

  /**
   * Simula webhook de confirmação de pagamento
   * Em produção, seria chamado pelo gateway de pagamento
   */
  async webhookPaymentConfirmation(transactionId: string) {
    const payment = await this.db.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Atualiza status para completed
    return this.db.payment.update({
      where: { id: payment.id },
      data: { status: 'completed' },
    });
  }

  /**
   * Calcula estatísticas de pagamento (admin)
   */
  async getPaymentStats(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalPayments, completedPayments, failedPayments, totalRevenue] =
      await Promise.all([
        this.db.payment.count({ where }),
        this.db.payment.count({
          where: { ...where, status: 'completed' },
        }),
        this.db.payment.count({
          where: { ...where, status: 'failed' },
        }),
        this.db.payment.aggregate({
          where: { ...where, status: 'completed' },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalPayments,
      completedPayments,
      failedPayments,
      successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  /**
   * Gera URL para Orange Money
   */
  private getOrangeMoneyUrl(transactionId: string, amount: number): string {
    // Em produção, usar API real do Orange Money
    const apiUrl = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com';
    return `${apiUrl}/payment/initiate?transactionId=${transactionId}&amount=${amount}`;
  }

  /**
   * Gera URL para MTN Mobile Money
   */
  private getMTNMobileMoneyUrl(transactionId: string, amount: number): string {
    // Em produção, usar API real do MTN Mobile Money
    const apiUrl = process.env.MTN_MOBILE_MONEY_API_URL || 'https://api.mtn.com';
    return `${apiUrl}/payment/initiate?transactionId=${transactionId}&amount=${amount}`;
  }

  /**
   * Gera URL para pagamento com cartão
   */
  private getCardPaymentUrl(transactionId: string, amount: number): string {
    // Em produção, usar gateway real (Stripe, PayPal, etc)
    const apiUrl = process.env.CARD_PAYMENT_GATEWAY_URL || 'https://gateway.example.com';
    return `${apiUrl}/checkout?transactionId=${transactionId}&amount=${amount}`;
  }

  /**
   * Verifica pagamento com gateway (produção)
   */
  private async verifyPaymentWithGateway(transactionId: string, provider: string): Promise<boolean> {
    // Em produção, fazer chamada real para o gateway
    // Por enquanto, retorna true (simula sucesso)
    try {
      // Exemplo de verificação:
      // const response = await fetch(`${gatewayUrl}/verify/${transactionId}`);
      // return response.status === 200;
      return true;
    } catch (error) {
      return false;
    }
  }
}
