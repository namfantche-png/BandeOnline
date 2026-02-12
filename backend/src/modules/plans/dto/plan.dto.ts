import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

/**
 * DTO para criar/atualizar plano
 */
export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  maxAds: number;

  @IsNumber()
  maxHighlights: number;

  @IsBoolean()
  hasStore: boolean;

  @IsOptional()
  @IsArray()
  features?: string[];
}

/**
 * DTO para resposta de plano
 */
export class PlanResponseDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  maxAds: number;
  maxHighlights: number;
  hasStore: boolean;
  features: string[];
}
