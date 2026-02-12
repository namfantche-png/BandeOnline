import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../config/database.config';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço de autenticação
 * Gerencia registro, login, refresh token e validação de usuários
 */
@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private moduleRef: ModuleRef,
  ) {}

  /**
   * Registra novo usuário
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Verifica se usuário já existe
    const existingUser = await this.db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já registrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria novo usuário
    const user = await this.db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    // Cria subscrição FREE automática
    try {
      // Busca ou cria o plano FREE se não existir
      let freePlan = await this.db.plan.findFirst({
        where: { name: 'FREE' },
      });

      // Se não encontrou, cria o plano FREE padrão
      if (!freePlan) {
        freePlan = await this.db.plan.create({
          data: {
            name: 'FREE',
            description: 'Plano gratuito com funcionalidades básicas',
            price: 0,
            currency: 'XOF',
            maxAds: 3,
            maxHighlights: 0,
            maxImages: 3,
            hasStore: false,
            adDuration: 30,
            features: ['Até 3 anúncios', '3 imagens por anúncio', 'Duração de 30 dias'],
          },
        });
      }

      // Verifica se já tem subscrição ativa
      const existingSubscription = await this.db.subscription.findFirst({
        where: {
          userId: user.id,
          planId: freePlan.id,
        },
      });

      // Só cria se não existir
      if (!existingSubscription) {
        await this.db.subscription.create({
          data: {
            userId: user.id,
            planId: freePlan.id,
            status: 'active', // Explícito: garante que seja ativo
          },
        });
      }
    } catch (error) {
      // Log do erro mas não bloqueia o registro
      console.error('Erro ao criar subscrição FREE:', error.message);
    }

    // Gera tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Realiza login do usuário
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Busca usuário
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verifica se usuário está bloqueado
    if (user.isBlocked) {
      throw new UnauthorizedException(
        user.blockedReason || 'Conta bloqueada. Entre em contato com o suporte.',
      );
    }

    // Verifica bloqueio temporário
    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      throw new UnauthorizedException(
        `Conta bloqueada até ${user.blockedUntil.toLocaleString()}`,
      );
    }

    // Valida senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Gera tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Atualiza último login
    await this.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Gera access token e refresh token
   */
  private async generateTokens(userId: string, email: string, role: string) {
    // Access token (curta duração - 15 minutos)
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
        type: 'access',
      },
      { expiresIn: '15m' },
    );

    // Refresh token (longa duração - 7 dias)
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        type: 'refresh',
        jti: uuidv4(), // ID único para invalidação
      },
      { expiresIn: '7d' },
    );

    // Salva refresh token no banco (para invalidação futura)
    await this.db.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutos em segundos
    };
  }

  /**
   * Renova tokens usando refresh token
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Verifica refresh token
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      // Busca usuário
      const user = await this.db.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Verifica se refresh token corresponde ao salvo
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      // Verifica se usuário está bloqueado
      if (user.isBlocked) {
        throw new UnauthorizedException('Conta bloqueada');
      }

      // Gera novos tokens
      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  /**
   * Realiza logout (invalida refresh token)
   */
  async logout(userId: string) {
    await this.db.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Valida senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza senha
    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Solicita recuperação de senha
   */
  async forgotPassword(email: string) {
    const user = await this.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Não revela se email existe
      return { message: 'Se o email existir, você receberá instruções de recuperação' };
    }

    // Gera token de recuperação
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira em 1 hora

    await this.db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Envia email com link de recuperação
    try {
      const emailService = this.moduleRef.get(EmailService, { strict: false });
      await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
    } catch (error) {
      // Loga erro mas não falha a operação
      console.error('Erro ao enviar email de recuperação:', error);
    }

    return {
      message: 'Se o email existir, você receberá instruções de recuperação',
      // Em desenvolvimento, retorna token para teste
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    };
  }

  /**
   * Reseta senha usando token de recuperação
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.db.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza senha e limpa token
    await this.db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  /**
   * Valida token JWT
   */
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Obtém usuário atual
   */
  async getCurrentUser(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.profile,
      currentPlan: user.subscriptions[0]?.plan?.name || 'FREE',
      createdAt: user.createdAt,
    };
  }
}
