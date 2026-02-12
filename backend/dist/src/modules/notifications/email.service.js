"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const notifications_service_1 = require("./notifications.service");
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor() {
        const emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        };
        if (process.env.EMAIL_SERVICE === 'sendgrid') {
            this.transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY,
                },
            });
        }
        else if (process.env.EMAIL_SERVICE === 'mailgun') {
            this.transporter = nodemailer.createTransport({
                service: 'Mailgun',
                auth: {
                    user: process.env.MAILGUN_USER,
                    pass: process.env.MAILGUN_PASSWORD,
                },
            });
        }
        else {
            this.transporter = nodemailer.createTransport(emailConfig);
        }
    }
    async sendPasswordResetEmail(email, firstName, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BissauMarket</h1>
            </div>
            <div class="content">
              <h2>Olá, ${firstName}!</h2>
              <p>Você solicitou a recuperação de senha da sua conta.</p>
              <p>Clique no botão abaixo para redefinir sua senha:</p>
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <p><strong>Este link expira em 1 hora.</strong></p>
              <p>Se você não solicitou esta recuperação, ignore este email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BissauMarket. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        await this.sendEmail({
            to: email,
            subject: 'Recuperação de Senha - BissauMarket',
            html,
        });
    }
    async sendNotificationEmail(email, firstName, title, message, type) {
        const icon = this.getNotificationIcon(type);
        const color = this.getNotificationColor(type);
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${color}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .icon { font-size: 48px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BissauMarket</h1>
            </div>
            <div class="content">
              <div class="icon">${icon}</div>
              <h2>${title}</h2>
              <p>Olá, ${firstName}!</p>
              <p>${message}</p>
              <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" style="color: ${color}; text-decoration: none;">Acessar Plataforma</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BissauMarket. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        await this.sendEmail({
            to: email,
            subject: `${title} - BissauMarket`,
            html,
        });
    }
    async sendEmail(options) {
        try {
            if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
                this.logger.log(`[DEV] Email não enviado (SMTP não configurado):`);
                this.logger.log(`Para: ${options.to}`);
                this.logger.log(`Assunto: ${options.subject}`);
                return;
            }
            const mailOptions = {
                from: process.env.SMTP_FROM || `BissauMarket <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html.replace(/<[^>]*>/g, ''),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email enviado com sucesso para ${options.to}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar email para ${options.to}:`, error.message);
            throw error;
        }
    }
    getNotificationIcon(type) {
        const icons = {
            [notifications_service_1.NotificationType.AD_EXPIRED]: '⏰',
            [notifications_service_1.NotificationType.AD_APPROVED]: '✅',
            [notifications_service_1.NotificationType.AD_REJECTED]: '❌',
            [notifications_service_1.NotificationType.SUBSCRIPTION_RENEWED]: '🔄',
            [notifications_service_1.NotificationType.PAYMENT_SUCCESS]: '💳',
            [notifications_service_1.NotificationType.PAYMENT_FAILED]: '⚠️',
            [notifications_service_1.NotificationType.MESSAGE_RECEIVED]: '💬',
            [notifications_service_1.NotificationType.REVIEW_RECEIVED]: '⭐',
            [notifications_service_1.NotificationType.USER_BLOCKED]: '🚫',
            [notifications_service_1.NotificationType.USER_UNBLOCKED]: '✅',
        };
        return icons[type] || '📢';
    }
    getNotificationColor(type) {
        const colors = {
            [notifications_service_1.NotificationType.AD_EXPIRED]: '#FF9800',
            [notifications_service_1.NotificationType.AD_APPROVED]: '#4CAF50',
            [notifications_service_1.NotificationType.AD_REJECTED]: '#F44336',
            [notifications_service_1.NotificationType.SUBSCRIPTION_RENEWED]: '#2196F3',
            [notifications_service_1.NotificationType.PAYMENT_SUCCESS]: '#4CAF50',
            [notifications_service_1.NotificationType.PAYMENT_FAILED]: '#F44336',
            [notifications_service_1.NotificationType.MESSAGE_RECEIVED]: '#2196F3',
            [notifications_service_1.NotificationType.REVIEW_RECEIVED]: '#FF9800',
            [notifications_service_1.NotificationType.USER_BLOCKED]: '#F44336',
            [notifications_service_1.NotificationType.USER_UNBLOCKED]: '#4CAF50',
        };
        return colors[type] || '#2196F3';
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map