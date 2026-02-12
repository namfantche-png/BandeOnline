import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../config/database.config';

/**
 * Guard para verificar se usuário é administrador
 * Deve ser usado após JwtAuthGuard
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Busca usuário no banco
    const dbUser = await this.db.user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    // Verifica se é admin
    if (dbUser.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    // Verifica se está bloqueado
    if (dbUser.isBlocked) {
      throw new ForbiddenException('Conta bloqueada');
    }

    return true;
  }
}
