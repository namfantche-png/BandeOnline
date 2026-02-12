import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/report.dto';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    createReport(user: any, createReportDto: CreateReportDto): Promise<{
        id: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        reporterId: string;
        reportedUserId: string | null;
        reportedAdId: string | null;
        reason: string;
        resolution: string | null;
    }>;
    getReports(status?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            reporterId: string;
            reportedUserId: string | null;
            reportedAdId: string | null;
            reason: string;
            resolution: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getPendingReports(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            reporterId: string;
            reportedUserId: string | null;
            reportedAdId: string | null;
            reason: string;
            resolution: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getReportById(reportId: string): Promise<{
        reporter: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        reporterId: string;
        reportedUserId: string | null;
        reportedAdId: string | null;
        reason: string;
        resolution: string | null;
    }>;
    approveReport(reportId: string, resolution: string): Promise<{
        id: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        reporterId: string;
        reportedUserId: string | null;
        reportedAdId: string | null;
        reason: string;
        resolution: string | null;
    }>;
    dismissReport(reportId: string, resolution: string): Promise<{
        id: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        reporterId: string;
        reportedUserId: string | null;
        reportedAdId: string | null;
        reason: string;
        resolution: string | null;
    }>;
}
