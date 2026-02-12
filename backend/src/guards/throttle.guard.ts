import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Armazenamento em memória para rate limiting
 * Em produção, usar Redis
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Decorator para definir limite de requisições
 */
export const RateLimit = (limit: number, windowMs: number = 60000) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', { limit, windowMs }, descriptor.value);
    return descriptor;
  };
};

/**
 * Guard de rate limiting
 * Protege endpoints contra abuso
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // Obtém configuração do decorator ou usa padrão
    const rateLimit = this.reflector.get<{ limit: number; windowMs: number }>(
      'rateLimit',
      handler,
    ) || { limit: 100, windowMs: 60000 }; // 100 req/min padrão

    // Gera chave única (IP + endpoint)
    const ip = this.getClientIp(request);
    const endpoint = `${request.method}:${request.route?.path || request.url}`;
    const key = `${ip}:${endpoint}`;

    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Se não existe registro ou expirou, cria novo
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + rateLimit.windowMs,
      });
      return true;
    }

    // Incrementa contador
    record.count++;

    // Verifica se excedeu limite
    if (record.count > rateLimit.limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Obtém IP do cliente
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}

/**
 * Limpa registros expirados periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // A cada minuto
