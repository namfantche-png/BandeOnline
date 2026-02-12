"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIpBlocked = exports.unblockIp = exports.blockIp = exports.IpBlockMiddleware = exports.RequestLoggerMiddleware = exports.SanitizeMiddleware = exports.SecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
let SecurityMiddleware = class SecurityMiddleware {
    use(req, res, next) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Content-Security-Policy', "default-src 'self' http://localhost:* http://127.0.0.1:*; img-src 'self' data: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*; style-src 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:*;");
        res.removeHeader('X-Powered-By');
        next();
    }
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = __decorate([
    (0, common_1.Injectable)()
], SecurityMiddleware);
let SanitizeMiddleware = class SanitizeMiddleware {
    use(req, res, next) {
        if (req.body && typeof req.body === 'object') {
            req.body = this.sanitizeObject(req.body);
        }
        next();
    }
    sanitizeObject(obj) {
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitizeObject(item));
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key of Object.keys(obj)) {
                sanitized[key] = this.sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    }
    sanitizeString(str) {
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    }
};
exports.SanitizeMiddleware = SanitizeMiddleware;
exports.SanitizeMiddleware = SanitizeMiddleware = __decorate([
    (0, common_1.Injectable)()
], SanitizeMiddleware);
let RequestLoggerMiddleware = class RequestLoggerMiddleware {
    use(req, res, next) {
        const start = Date.now();
        const { method, originalUrl, ip } = req;
        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;
            if (process.env.NODE_ENV === 'development' || statusCode >= 400) {
                console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip}`);
            }
        });
        next();
    }
};
exports.RequestLoggerMiddleware = RequestLoggerMiddleware;
exports.RequestLoggerMiddleware = RequestLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestLoggerMiddleware);
const blockedIps = new Set();
let IpBlockMiddleware = class IpBlockMiddleware {
    use(req, res, next) {
        const ip = this.getClientIp(req);
        if (blockedIps.has(ip)) {
            res.status(403).json({
                statusCode: 403,
                message: 'Acesso bloqueado',
            });
            return;
        }
        next();
    }
    getClientIp(req) {
        return (req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.ip ||
            'unknown');
    }
};
exports.IpBlockMiddleware = IpBlockMiddleware;
exports.IpBlockMiddleware = IpBlockMiddleware = __decorate([
    (0, common_1.Injectable)()
], IpBlockMiddleware);
const blockIp = (ip) => blockedIps.add(ip);
exports.blockIp = blockIp;
const unblockIp = (ip) => blockedIps.delete(ip);
exports.unblockIp = unblockIp;
const isIpBlocked = (ip) => blockedIps.has(ip);
exports.isIpBlocked = isIpBlocked;
//# sourceMappingURL=security.middleware.js.map