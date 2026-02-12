import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../config/database.config';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private db;
    private jwtService;
    private moduleRef;
    constructor(db: DatabaseService, jwtService: JwtService, moduleRef: ModuleRef);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            isVerified: boolean;
        };
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            isVerified: boolean;
        };
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>;
    private generateTokens;
    refreshTokens(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        resetToken?: string | undefined;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    validateToken(token: string): Promise<any>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatar: string | null;
        role: string;
        isVerified: boolean;
        profile: {
            id: string;
            userId: string;
            location: string | null;
            city: string | null;
            country: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            rating: number;
            bio: string | null;
            website: string | null;
            socialLinks: import(".prisma/client/runtime/client").JsonValue | null;
            reviewCount: number;
            totalAds: number;
        } | null;
        currentPlan: string;
        createdAt: Date;
    }>;
}
