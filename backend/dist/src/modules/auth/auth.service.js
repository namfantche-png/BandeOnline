"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const database_config_1 = require("../../config/database.config");
const email_service_1 = require("../notifications/email.service");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    db;
    jwtService;
    moduleRef;
    constructor(db, jwtService, moduleRef) {
        this.db = db;
        this.jwtService = jwtService;
        this.moduleRef = moduleRef;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone } = registerDto;
        const existingUser = await this.db.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email já registrado');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.db.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                profile: {
                    create: {},
                },
            },
            include: {
                profile: true,
            },
        });
        try {
            let freePlan = await this.db.plan.findFirst({
                where: { name: 'FREE' },
            });
            if (!freePlan) {
                freePlan = await this.db.plan.create({
                    data: {
                        name: 'FREE',
                        description: 'Plano gratuito com funcionalidades básicas',
                        price: 0,
                        currency: 'XOF',
                        maxAds: 3,
                        maxHighlights: 0,
                        maxImages: 3,
                        hasStore: false,
                        adDuration: 30,
                        features: ['Até 3 anúncios', '3 imagens por anúncio', 'Duração de 30 dias'],
                    },
                });
            }
            const existingSubscription = await this.db.subscription.findFirst({
                where: {
                    userId: user.id,
                    planId: freePlan.id,
                },
            });
            if (!existingSubscription) {
                await this.db.subscription.create({
                    data: {
                        userId: user.id,
                        planId: freePlan.id,
                        status: 'active',
                    },
                });
            }
        }
        catch (error) {
            console.error('Erro ao criar subscrição FREE:', error.message);
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: user.isVerified,
            },
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.db.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email ou senha inválidos');
        }
        if (user.isBlocked) {
            throw new common_1.UnauthorizedException(user.blockedReason || 'Conta bloqueada. Entre em contato com o suporte.');
        }
        if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
            throw new common_1.UnauthorizedException(`Conta bloqueada até ${user.blockedUntil.toLocaleString()}`);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email ou senha inválidos');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
            },
        };
    }
    async generateTokens(userId, email, role) {
        const accessToken = this.jwtService.sign({
            sub: userId,
            email,
            role,
            type: 'access',
        }, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign({
            sub: userId,
            email,
            type: 'refresh',
            jti: (0, uuid_1.v4)(),
        }, { expiresIn: '7d' });
        await this.db.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Token inválido');
            }
            const user = await this.db.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Usuário não encontrado');
            }
            if (user.refreshToken !== refreshToken) {
                throw new common_1.UnauthorizedException('Token inválido ou expirado');
            }
            if (user.isBlocked) {
                throw new common_1.UnauthorizedException('Conta bloqueada');
            }
            return this.generateTokens(user.id, user.email, user.role);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido ou expirado');
        }
    }
    async logout(userId) {
        await this.db.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { message: 'Logout realizado com sucesso' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Senha atual incorreta');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.db.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Senha alterada com sucesso' };
    }
    async forgotPassword(email) {
        const user = await this.db.user.findUnique({
            where: { email },
        });
        if (!user) {
            return { message: 'Se o email existir, você receberá instruções de recuperação' };
        }
        const resetToken = (0, uuid_1.v4)();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1);
        await this.db.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires,
            },
        });
        try {
            const emailService = this.moduleRef.get(email_service_1.EmailService, { strict: false });
            await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
        }
        catch (error) {
            console.error('Erro ao enviar email de recuperação:', error);
        }
        return {
            message: 'Se o email existir, você receberá instruções de recuperação',
            ...(process.env.NODE_ENV === 'development' && { resetToken }),
        };
    }
    async resetPassword(token, newPassword) {
        const user = await this.db.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Token inválido ou expirado');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.db.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        return { message: 'Senha redefinida com sucesso' };
    }
    async validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
    async getCurrentUser(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                subscriptions: {
                    where: { status: 'active' },
                    include: { plan: true },
                    take: 1,
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado');
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.profile,
            currentPlan: user.subscriptions[0]?.plan?.name || 'FREE',
            createdAt: user.createdAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService,
        jwt_1.JwtService,
        core_1.ModuleRef])
], AuthService);
//# sourceMappingURL=auth.service.js.map