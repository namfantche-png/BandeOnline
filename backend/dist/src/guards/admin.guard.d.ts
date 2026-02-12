import { CanActivate, ExecutionContext } from '@nestjs/common';
import { DatabaseService } from '../config/database.config';
export declare class AdminGuard implements CanActivate {
    private db;
    constructor(db: DatabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
