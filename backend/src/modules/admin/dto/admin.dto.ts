import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsDate } from 'class-validator';

/**
 * Enum para status de usuário
 */
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

/**
 * Enum para status de anúncio
 */
export enum AdModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

/**
 * DTO para filtrar usuários
 */
export class FilterUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

/**
 * DTO para bloquear usuário
 */
export class BlockUserDto {
  @IsString()
  userId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number; // null = permanente
}

/**
 * DTO para moderar anúncio
 */
export class ModerateAdDto {
  @IsString()
  adId: string;

  @IsEnum(AdModerationStatus)
  status: AdModerationStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO para criar/editar categoria
 */
export class AdminCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  parentId?: string; // Para subcategorias

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}

/**
 * DTO para criar/editar plano
 */
export class AdminPlanDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  maxAds: number;

  @IsNumber()
  maxHighlights: number;

  @IsNumber()
  maxImages: number;

  @IsBoolean()
  hasStore: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para relatório financeiro
 */
export class FinancialReportDto {
  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * DTO para log de admin
 */
export class AdminLogDto {
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  adminId: string;
}

/**
 * DTO para alterar plano do usuário
 */
export class ChangeUserPlanDto {
  @IsString()
  userId: string;

  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Resposta de estatísticas do dashboard
 */
export class DashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalAds: number;
  activeAds: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingReports: number;
  pendingAds: number;
}
