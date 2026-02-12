import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO para criar avaliação
 */
export class CreateReviewDto {
  @IsString()
  reviewedUserId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  adId?: string; // Anúncio relacionado à transação
}

/**
 * DTO para atualizar avaliação
 */
export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

/**
 * DTO para resposta de avaliação
 */
export class ReviewResponseDto {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  adId?: string;
  createdAt: Date;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

/**
 * DTO para estatísticas de avaliação
 */
export class ReviewStatsDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
