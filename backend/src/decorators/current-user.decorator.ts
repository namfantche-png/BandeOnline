import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para extrair o usuário autenticado da requisição
 * Uso: @CurrentUser() user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
