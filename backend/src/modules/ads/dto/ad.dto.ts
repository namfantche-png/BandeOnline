import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  MinLength,
  MaxLength,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

/**
 * Enum para condição do produto
 */
export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  USED = 'used',
  FOR_REPAIR = 'for_repair',
}

/**
 * DTO para criar anúncio
 */
export class CreateAdDto {
  @IsString()
  @MinLength(5, { message: 'Título deve ter no mínimo 5 caracteres' })
  @MaxLength(100, { message: 'Título deve ter no máximo 100 caracteres' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'Descrição deve ter no mínimo 20 caracteres' })
  @MaxLength(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' })
  description: string;

  @IsNumber()
  @Min(0, { message: 'Preço não pode ser negativo' })
  @Max(99999999, { message: 'Preço inválido' })
  price: number;

  @IsString()
  categoryId: string;

  @IsString()
  @MinLength(2, { message: 'Localidade inválida' })
  location: string;

  @IsString()
  @MinLength(2, { message: 'Cidade inválida' })
  city: string;

  @IsString()
  @MinLength(2, { message: 'País inválido' })
  country: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactWhatsapp?: string;

  @IsOptional()
  @IsString()
  subcategoryId?: string;
}

/**
 * DTO para atualizar anúncio
 */
export class UpdateAdDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Título deve ter no mínimo 5 caracteres' })
  @MaxLength(100, { message: 'Título deve ter no máximo 100 caracteres' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Descrição deve ter no mínimo 20 caracteres' })
  @MaxLength(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Preço não pode ser negativo' })
  @Max(99999999, { message: 'Preço inválido' })
  price?: number;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Localidade inválida' })
  location?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Cidade inválida' })
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'País inválido' })
  country?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactWhatsapp?: string;

  /** URLs das imagens existentes a manter (JSON string quando enviado via FormData) */
  @IsOptional()
  existingImages?: string[] | string;
}

/**
 * DTO para resposta de anúncio
 */
export class AdResponseDto {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  city: string;
  country: string;
  images: string[];
  condition: string;
  status: string;
  isHighlighted: boolean;
  views: number;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
  };
}
