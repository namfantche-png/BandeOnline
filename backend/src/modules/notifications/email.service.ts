import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationType } from './notifications.service';

/**
 * Serviço de email
 * Gerencia envio de emails usando SMTP ou serviço de email
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configura transporter baseado em variáveis de ambiente
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Se usar serviço de email (SendGrid, Mailgun, etc)
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else if (process.env.EMAIL_SERVICE === 'mailgun') {
      this.transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USER,
          pass: process.env.MAILGUN_PASSWORD,
        },
      });
    } else {
      // SMTP padrão
      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
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

  /**
   * Envia email de notificação
   */
  async sendNotificationEmail(
    email: string,
    firstName: string,
    title: string,
    message: string,
    type: NotificationType,
  ): Promise<void> {
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

  /**
   * Envia email genérico
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    try {
      // Em desenvolvimento, apenas loga se não houver configuração SMTP
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
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${options.to}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém ícone para tipo de notificação
   */
  private getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.AD_EXPIRED]: '⏰',
      [NotificationType.AD_APPROVED]: '✅',
      [NotificationType.AD_REJECTED]: '❌',
      [NotificationType.SUBSCRIPTION_RENEWED]: '🔄',
      [NotificationType.PAYMENT_SUCCESS]: '💳',
      [NotificationType.PAYMENT_FAILED]: '⚠️',
      [NotificationType.MESSAGE_RECEIVED]: '💬',
      [NotificationType.REVIEW_RECEIVED]: '⭐',
      [NotificationType.USER_BLOCKED]: '🚫',
      [NotificationType.USER_UNBLOCKED]: '✅',
    };
    return icons[type] || '📢';
  }

  /**
   * Obtém cor para tipo de notificação
   */
  private getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      [NotificationType.AD_EXPIRED]: '#FF9800',
      [NotificationType.AD_APPROVED]: '#4CAF50',
      [NotificationType.AD_REJECTED]: '#F44336',
      [NotificationType.SUBSCRIPTION_RENEWED]: '#2196F3',
      [NotificationType.PAYMENT_SUCCESS]: '#4CAF50',
      [NotificationType.PAYMENT_FAILED]: '#F44336',
      [NotificationType.MESSAGE_RECEIVED]: '#2196F3',
      [NotificationType.REVIEW_RECEIVED]: '#FF9800',
      [NotificationType.USER_BLOCKED]: '#F44336',
      [NotificationType.USER_UNBLOCKED]: '#4CAF50',
    };
    return colors[type] || '#2196F3';
  }
}
