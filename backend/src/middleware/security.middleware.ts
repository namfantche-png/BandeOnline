import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de segurança
 * Adiciona headers de segurança e proteções básicas
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Headers de segurança
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' http://localhost:* http://127.0.0.1:*; img-src 'self' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*; style-src 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:*;",
    );

    // Remove header que revela tecnologia
    res.removeHeader('X-Powered-By');

    next();
  }
}

/**
 * Middleware de sanitização de inputs
 * Remove caracteres perigosos de strings
 */
@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  }

  private sanitizeString(str: string): string {
    // Remove tags HTML básicas
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}

/**
 * Middleware de logging de requisições
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Log apenas em desenvolvimento ou para erros
      if (process.env.NODE_ENV === 'development' || statusCode >= 400) {
        console.log(
          `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`,
        );
      }
    });

    next();
  }
}

/**
 * Lista de IPs bloqueados (em memória, usar Redis em produção)
 */
const blockedIps = new Set<string>();

/**
 * Middleware de bloqueio de IP
 */
@Injectable()
export class IpBlockMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = this.getClientIp(req);

    if (blockedIps.has(ip)) {
      res.status(403).json({
        statusCode: 403,
        message: 'Acesso bloqueado',
      });
      return;
    }

    next();
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }
}

/**
 * Funções auxiliares para gerenciar IPs bloqueados
 */
export const blockIp = (ip: string) => blockedIps.add(ip);
export const unblockIp = (ip: string) => blockedIps.delete(ip);
export const isIpBlocked = (ip: string) => blockedIps.has(ip);
