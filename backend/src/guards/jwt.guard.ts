import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT para proteger rotas
 * Valida a presença e validade do token JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
