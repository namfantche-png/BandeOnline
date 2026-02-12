import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refreshTokens(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>;
    logout(user?: any): Promise<{
        message: string;
    }>;
    getCurrentUser(user: any): Promise<{
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
    changePassword(user: any, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        resetToken?: string | undefined;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
