import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export interface DatabaseService extends PrismaClient, OnModuleInit, OnModuleDestroy {
    [key: string]: any;
}
export declare const DatabaseService: new () => DatabaseService;
