import { IsString, IsOptional } from 'class-validator';

/**
 * DTO para upgrade de plano
 */
export class UpgradePlanDto {
  @IsString()
  planId: string;
}

/**
 * DTO para resposta de subscrição
 */
export class SubscriptionResponseDto {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  autoRenew: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    maxAds: number;
    maxHighlights: number;
  };
}
