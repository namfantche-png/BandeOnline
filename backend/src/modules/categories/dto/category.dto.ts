import { IsString, IsOptional } from 'class-validator';

/**
 * DTO para criar/atualizar categoria
 */
export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

/**
 * DTO para resposta de categoria
 */
export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}
