import { IsString, IsOptional, IsEmail } from 'class-validator';

/**
 * DTO para atualizar perfil de usuário
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  website?: string;
}

/**
 * DTO para resposta de perfil
 */
export class UserProfileResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  profile: {
    bio?: string;
    location?: string;
    city?: string;
    country?: string;
    rating: number;
    reviewCount: number;
    totalAds: number;
  };
}
