import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(user: any, sendMessageDto: SendMessageDto): Promise<{
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
    getConversation(user: any, otherUserId: string, page?: number, limit?: number): Promise<{
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
    getConversations(user: any): Promise<any[]>;
    getUnreadMessages(user: any): Promise<({
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
    markAsRead(user: any, messageId: string): Promise<{
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
    markAllAsRead(user: any, senderId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteMessage(user: any, messageId: string): Promise<{
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
    blockUser(user: any, blockedUserId: string): Promise<{
        message: string;
        blockedUserId: string;
        blockedUser: any;
    }>;
    unblockUser(user: any, unblockedUserId: string): Promise<{
        message: string;
        unblockedUserId: string;
    }>;
}
