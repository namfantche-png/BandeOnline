import { PrismaClient } from '@prisma/client';
export declare class DatabaseInitService {
    private readonly logger;
    private readonly prisma;
    constructor(prisma: PrismaClient);
    initialize(): Promise<void>;
    private testConnection;
    private verifyDatabase;
    private runMigrations;
    private validateSchema;
    private runSeed;
}
