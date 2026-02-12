import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private invoicesService;
    constructor(invoicesService: InvoicesService);
    getUserInvoices(user: any, page?: number, limit?: number): Promise<{
        data: ({
            payment: {
                method: string;
                provider: string | null;
                transactionId: string | null;
            };
        } & {
            id: string;
            userId: string;
            description: string | null;
            currency: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            amount: number;
            paymentId: string;
            invoiceNumber: string;
            issuedAt: Date;
            dueDate: Date | null;
            paidAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getInvoiceById(user: any, invoiceId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        payment: {
            id: string;
            userId: string;
            description: string | null;
            currency: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            subscriptionId: string | null;
            amount: number;
            method: string;
            provider: string | null;
            transactionId: string | null;
            failureReason: string | null;
            completedAt: Date | null;
        };
    } & {
        id: string;
        userId: string;
        description: string | null;
        currency: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        paymentId: string;
        invoiceNumber: string;
        issuedAt: Date;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    getInvoiceByNumber(invoiceNumber: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        payment: {
            id: string;
            userId: string;
            description: string | null;
            currency: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            subscriptionId: string | null;
            amount: number;
            method: string;
            provider: string | null;
            transactionId: string | null;
            failureReason: string | null;
            completedAt: Date | null;
        };
    } & {
        id: string;
        userId: string;
        description: string | null;
        currency: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        paymentId: string;
        invoiceNumber: string;
        issuedAt: Date;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    generateInvoice(paymentId: string): Promise<{
        id: string;
        userId: string;
        description: string | null;
        currency: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        paymentId: string;
        invoiceNumber: string;
        issuedAt: Date;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    getInvoiceForPdf(invoiceId: string): Promise<{
        invoiceNumber: string;
        issuedAt: Date;
        paidAt: Date | null;
        status: string;
        customer: {
            name: string;
            email: string;
            phone: string | null;
        };
        items: {
            description: string | null;
            quantity: number;
            unitPrice: number;
            total: number;
        }[];
        subtotal: number;
        tax: number;
        total: number;
        currency: string;
        company: {
            name: string;
            address: string;
            email: string;
            phone: string;
            website: string;
        };
        paymentMethod: string;
        transactionId: string | null;
    }>;
}
