import { DatabaseService } from '../../config/database.config';
import { SendMessageDto } from './dto/message.dto';
export declare class MessagesService {
    private db;
    constructor(db: DatabaseService);
    sendMessage(senderId: string, sendMessageDto: SendMessageDto): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
        adId: string | null;
        content: string;
        isRead: boolean;
        imageUrl: string | null;
        locationLat: number | null;
        locationLng: number | null;
        locationAddress: string | null;
    }>;
    getConversation(userId: string, otherUserId: string, page?: number, limit?: number): Promise<{
        data: ({
            sender: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            senderId: string;
            receiverId: string;
            adId: string | null;
            content: string;
            isRead: boolean;
            imageUrl: string | null;
            locationLat: number | null;
            locationLng: number | null;
            locationAddress: string | null;
        })[];
        otherUser: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getConversations(userId: string): Promise<any[]>;
    getUnreadMessages(userId: string): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
        adId: string | null;
        content: string;
        isRead: boolean;
        imageUrl: string | null;
        locationLat: number | null;
        locationLng: number | null;
        locationAddress: string | null;
    })[]>;
    markAsRead(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
        adId: string | null;
        content: string;
        isRead: boolean;
        imageUrl: string | null;
        locationLat: number | null;
        locationLng: number | null;
        locationAddress: string | null;
    }>;
    markAllAsRead(userId: string, senderId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteMessage(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        senderId: string;
        receiverId: string;
        adId: string | null;
        content: string;
        isRead: boolean;
        imageUrl: string | null;
        locationLat: number | null;
        locationLng: number | null;
        locationAddress: string | null;
    }>;
    blockUser(userId: string, blockedUserId: string): Promise<{
        message: string;
        blockedUserId: string;
        blockedUser: any;
    }>;
    unblockUser(userId: string, unblockedUserId: string): Promise<{
        message: string;
        unblockedUserId: string;
    }>;
    isUserBlocked(blockerId: string, blockedUserId: string): Promise<boolean>;
    getBlockedUsers(userId: string): Promise<any>;
}
