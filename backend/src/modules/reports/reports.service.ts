import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { CreateReportDto } from './dto/report.dto';

/**
 * Serviço de denúncias
 * Gerencia denúncias de usuários e anúncios
 */
@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  /**
   * Cria denúncia
   */
  async createReport(reporterId: string, createReportDto: CreateReportDto) {
    const { reason, reportedUserId, reportedAdId, description } = createReportDto;

    // Verifica se pelo menos um alvo foi informado
    if (!reportedUserId && !reportedAdId) {
      throw new BadRequestException('Informe um usuário ou anúncio para denunciar');
    }

    // Verifica se usuário denunciado existe
    if (reportedUserId) {
      const user = await this.db.user.findUnique({
        where: { id: reportedUserId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
    }

    // Verifica se anúncio denunciado existe
    if (reportedAdId) {
      const ad = await this.db.ad.findUnique({
        where: { id: reportedAdId },
      });

      if (!ad) {
        throw new NotFoundException('Anúncio não encontrado');
      }
    }

    // Cria denúncia
    const report = await this.db.report.create({
      data: {
        reporterId,
        reportedUserId,
        reportedAdId,
        reason,
        description,
        status: 'pending',
      },
    });

    return report;
  }

  /**
   * Obtém denúncias (admin)
   */
  async getReports(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.db.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém denúncia por ID
   */
  async getReportById(reportId: string) {
    const report = await this.db.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    return report;
  }

  /**
   * Aprova denúncia e bloqueia usuário/anúncio
   */
  async approveReport(reportId: string, resolution: string) {
    const report = await this.db.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    // Atualiza status da denúncia
    const updatedReport = await this.db.report.update({
      where: { id: reportId },
      data: {
        status: 'resolved',
        resolution,
      },
    });

    // Bloqueia usuário se denúncia for sobre usuário
    if (report.reportedUserId) {
      await this.db.user.update({
        where: { id: report.reportedUserId },
        data: {
          isBlocked: true,
          blockedReason: `Denúncia aprovada: ${resolution}`,
        },
      });
    }

    // Remove anúncio se denúncia for sobre anúncio
    if (report.reportedAdId) {
      await this.db.ad.update({
        where: { id: report.reportedAdId },
        data: { status: 'removed' },
      });
    }

    return updatedReport;
  }

  /**
   * Rejeita denúncia
   */
  async dismissReport(reportId: string, resolution: string) {
    const report = await this.db.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    return this.db.report.update({
      where: { id: reportId },
      data: {
        status: 'dismissed',
        resolution,
      },
    });
  }

  /**
   * Obtém denúncias pendentes (admin)
   */
  async getPendingReports(page: number = 1, limit: number = 20) {
    return this.getReports('pending', page, limit);
  }

  /**
   * Conta denúncias por usuário
   */
  async getReportCountByUser(userId: string): Promise<number> {
    return this.db.report.count({
      where: {
        reportedUserId: userId,
        status: 'resolved',
      },
    });
  }
}
