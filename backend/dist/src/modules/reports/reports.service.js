"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let ReportsService = class ReportsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createReport(reporterId, createReportDto) {
        const { reason, reportedUserId, reportedAdId, description } = createReportDto;
        if (!reportedUserId && !reportedAdId) {
            throw new common_1.BadRequestException('Informe um usuário ou anúncio para denunciar');
        }
        if (reportedUserId) {
            const user = await this.db.user.findUnique({
                where: { id: reportedUserId },
            });
            if (!user) {
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
        }
        if (reportedAdId) {
            const ad = await this.db.ad.findUnique({
                where: { id: reportedAdId },
            });
            if (!ad) {
                throw new common_1.NotFoundException('Anúncio não encontrado');
            }
        }
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
    async getReports(status, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
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
    async getReportById(reportId) {
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
            throw new common_1.NotFoundException('Denúncia não encontrada');
        }
        return report;
    }
    async approveReport(reportId, resolution) {
        const report = await this.db.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Denúncia não encontrada');
        }
        const updatedReport = await this.db.report.update({
            where: { id: reportId },
            data: {
                status: 'resolved',
                resolution,
            },
        });
        if (report.reportedUserId) {
            await this.db.user.update({
                where: { id: report.reportedUserId },
                data: {
                    isBlocked: true,
                    blockedReason: `Denúncia aprovada: ${resolution}`,
                },
            });
        }
        if (report.reportedAdId) {
            await this.db.ad.update({
                where: { id: report.reportedAdId },
                data: { status: 'removed' },
            });
        }
        return updatedReport;
    }
    async dismissReport(reportId, resolution) {
        const report = await this.db.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Denúncia não encontrada');
        }
        return this.db.report.update({
            where: { id: reportId },
            data: {
                status: 'dismissed',
                resolution,
            },
        });
    }
    async getPendingReports(page = 1, limit = 20) {
        return this.getReports('pending', page, limit);
    }
    async getReportCountByUser(userId) {
        return this.db.report.count({
            where: {
                reportedUserId: userId,
                status: 'resolved',
            },
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map