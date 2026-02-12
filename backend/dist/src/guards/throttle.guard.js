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
exports.ThrottleGuard = exports.RateLimit = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rateLimitStore = new Map();
const RateLimit = (limit, windowMs = 60000) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('rateLimit', { limit, windowMs }, descriptor.value);
        return descriptor;
    };
};
exports.RateLimit = RateLimit;
let ThrottleGuard = class ThrottleGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const rateLimit = this.reflector.get('rateLimit', handler) || { limit: 100, windowMs: 60000 };
        const ip = this.getClientIp(request);
        const endpoint = `${request.method}:${request.route?.path || request.url}`;
        const key = `${ip}:${endpoint}`;
        const now = Date.now();
        const record = rateLimitStore.get(key);
        if (!record || now > record.resetTime) {
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + rateLimit.windowMs,
            });
            return true;
        }
        record.count++;
        if (record.count > rateLimit.limit) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: 'Muitas requisições. Tente novamente mais tarde.',
                retryAfter,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
    getClientIp(request) {
        return (request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.ip ||
            'unknown');
    }
};
exports.ThrottleGuard = ThrottleGuard;
exports.ThrottleGuard = ThrottleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ThrottleGuard);
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000);
//# sourceMappingURL=throttle.guard.js.map