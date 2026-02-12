import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

/**
 * Enum para métodos de pagamento
 */
export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
  BANK = 'bank',
}

/**
 * Enum para provedores de Mobile Money
 */
export enum MobileMoneyProvider {
  ORANGE_MONEY = 'orange_money',
  MTN_MONEY = 'mtn_money',
}

/**
 * DTO para iniciar pagamento
 */
export class InitiatePaymentDto {
  @IsNumber()
  @Min(100, { message: 'Valor mínimo é 100 XOF' })
  @Max(99999999, { message: 'Valor máximo é 99.999.999 XOF' })
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsEnum(MobileMoneyProvider)
  provider?: MobileMoneyProvider;

  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para confirmar pagamento (mock)
 */
export class ConfirmPaymentDto {
  @IsString()
  transactionId: string;

  @IsString()
  paymentId: string;
}

/**
 * DTO para resposta de pagamento
 */
export class PaymentResponseDto {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  provider?: string;
  transactionId?: string;
  description?: string;
  createdAt: Date;
}
