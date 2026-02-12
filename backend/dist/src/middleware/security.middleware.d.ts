import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class SecurityMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class SanitizeMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
    private sanitizeObject;
    private sanitizeString;
}
export declare class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class IpBlockMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
    private getClientIp;
}
export declare const blockIp: (ip: string) => Set<string>;
export declare const unblockIp: (ip: string) => boolean;
export declare const isIpBlocked: (ip: string) => boolean;
