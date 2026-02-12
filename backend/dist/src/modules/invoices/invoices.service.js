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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let InvoicesService = class InvoicesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async generateInvoice(paymentId) {
        const payment = await this.db.payment.findUnique({
            where: { id: paymentId },
            include: { user: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        if (payment.status !== 'completed') {
            throw new common_1.BadRequestException('Pagamento não foi concluído');
        }
        const existingInvoice = await this.db.invoice.findUnique({
            where: { paymentId },
        });
        if (existingInvoice) {
            return existingInvoice;
        }
        const invoiceNumber = await this.generateInvoiceNumber();
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
    async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const prefix = `BM-${year}`;
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
    async getInvoiceById(invoiceId, userId) {
        const where = { id: invoiceId };
        if (userId)
            where.userId = userId;
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
            throw new common_1.NotFoundException('Fatura não encontrada');
        }
        return invoice;
    }
    async getInvoiceByNumber(invoiceNumber) {
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
            throw new common_1.NotFoundException('Fatura não encontrada');
        }
        return invoice;
    }
    async getUserInvoices(userId, page = 1, limit = 10) {
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
    async getInvoiceForPdf(invoiceId) {
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
            tax: 0,
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
    async getAllInvoices(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
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
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map