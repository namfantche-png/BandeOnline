export declare class CreateReportDto {
    reason: string;
    reportedUserId?: string;
    reportedAdId?: string;
    description?: string;
}
export declare class ReportResponseDto {
    id: string;
    reporterId: string;
    reportedUserId?: string;
    reportedAdId?: string;
    reason: string;
    description?: string;
    status: string;
    createdAt: Date;
}
