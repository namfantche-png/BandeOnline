import { IsString, IsOptional } from 'class-validator';

/**
 * DTO para criar denúncia
 */
export class CreateReportDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  reportedUserId?: string;

  @IsOptional()
  @IsString()
  reportedAdId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para resposta de denúncia
 */
export class ReportResponseDto {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedAdId?: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: Date;
}
