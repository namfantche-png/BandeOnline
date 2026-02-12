"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let PaymentsService = class PaymentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async initiatePayment(userId, initiatePaymentDto) {
        const { amount, currency, method, provider, planId, description } = initiatePaymentDto;
        const plan = await this.db.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plano não encontrado');
        }
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
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db.payment.update({
            where: { id: payment.id },
            data: { transactionId },
        });
        let redirectUrl = null;
        let message = 'Pagamento iniciado. Confirme a transação no seu dispositivo móvel.';
        if (provider === 'orange_money') {
            redirectUrl = this.getOrangeMoneyUrl(transactionId, amount);
            message = 'Redirecionando para Orange Money...';
        }
        else if (provider === 'mtn_money') {
            redirectUrl = this.getMTNMobileMoneyUrl(transactionId, amount);
            message = 'Redirecionando para MTN Mobile Money...';
        }
        else if (method === 'card') {
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
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };
    }
    async confirmPayment(userId, confirmPaymentDto) {
        const { transactionId, paymentId } = confirmPaymentDto;
        const payment = await this.db.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        if (payment.userId !== userId) {
            throw new common_1.BadRequestException('Pagamento não pertence ao usuário');
        }
        if (payment.status !== 'pending') {
            throw new common_1.BadRequestException('Pagamento já foi processado');
        }
        const paymentAge = Date.now() - new Date(payment.createdAt).getTime();
        const fifteenMinutes = 15 * 60 * 1000;
        if (paymentAge > fifteenMinutes) {
            await this.db.payment.update({
                where: { id: paymentId },
                data: { status: 'expired' },
            });
            throw new common_1.BadRequestException('Pagamento expirado. Inicie um novo pagamento.');
        }
        const isSuccessful = process.env.NODE_ENV === 'production'
            ? await this.verifyPaymentWithGateway(transactionId, payment.provider || 'orange_money')
            : Math.random() > 0.1;
        if (!isSuccessful) {
            await this.db.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'failed',
                    transactionId,
                    failureReason: 'Falha na verificação do gateway de pagamento',
                },
            });
            throw new common_1.BadRequestException('Falha ao processar pagamento. Tente novamente.');
        }
        const updatedPayment = await this.db.payment.update({
            where: { id: paymentId },
            data: {
                status: 'completed',
                transactionId,
                completedAt: new Date(),
            },
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
    async getPaymentHistory(userId, page = 1, limit = 10) {
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
    async getPaymentDetails(paymentId, userId) {
        const payment = await this.db.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        if (payment.userId !== userId) {
            throw new common_1.BadRequestException('Acesso negado');
        }
        return payment;
    }
    async webhookPaymentConfirmation(transactionId) {
        const payment = await this.db.payment.findFirst({
            where: { transactionId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        return this.db.payment.update({
            where: { id: payment.id },
            data: { status: 'completed' },
        });
    }
    async getPaymentStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [totalPayments, completedPayments, failedPayments, totalRevenue] = await Promise.all([
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
    getOrangeMoneyUrl(transactionId, amount) {
        const apiUrl = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com';
        return `${apiUrl}/payment/initiate?transactionId=${transactionId}&amount=${amount}`;
    }
    getMTNMobileMoneyUrl(transactionId, amount) {
        const apiUrl = process.env.MTN_MOBILE_MONEY_API_URL || 'https://api.mtn.com';
        return `${apiUrl}/payment/initiate?transactionId=${transactionId}&amount=${amount}`;
    }
    getCardPaymentUrl(transactionId, amount) {
        const apiUrl = process.env.CARD_PAYMENT_GATEWAY_URL || 'https://gateway.example.com';
        return `${apiUrl}/checkout?transactionId=${transactionId}&amount=${amount}`;
    }
    async verifyPaymentWithGateway(transactionId, provider) {
        try {
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map