import { ModuleRef } from '@nestjs/core';
import { DatabaseService } from '../../config/database.config';
export declare class TasksService {
    private db;
    private moduleRef;
    private readonly logger;
    constructor(db: DatabaseService, moduleRef: ModuleRef);
    expireAds(): Promise<void>;
    removeExpiredHighlights(): Promise<void>;
    renewSubscriptions(): Promise<void>;
    unblockExpiredUsers(): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
    generateDailyReport(): Promise<void>;
}
