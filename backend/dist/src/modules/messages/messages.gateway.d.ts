import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DatabaseService } from '../../config/database.config';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private db;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(db: DatabaseService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSendMessage(client: Socket, payload: {
        receiverId: string;
        content: string;
        adId?: string;
        location?: {
            lat: number;
            lng: number;
            address?: string;
        };
        imageUrl?: string;
    }): Promise<void>;
    handleMessageRead(client: Socket, payload: {
        messageId: string;
    }): Promise<void>;
    handleTyping(client: Socket, payload: {
        receiverId: string;
    }): void;
    handleStopTyping(client: Socket, payload: {
        receiverId: string;
    }): void;
    handleGetOnlineUsers(client: Socket): void;
    handlePing(client: Socket): void;
    private broadcastOnlineUsers;
}
