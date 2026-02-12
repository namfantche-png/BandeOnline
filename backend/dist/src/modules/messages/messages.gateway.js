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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let MessagesGateway = MessagesGateway_1 = class MessagesGateway {
    db;
    server;
    logger = new common_1.Logger(MessagesGateway_1.name);
    connectedUsers = new Map();
    constructor(db) {
        this.db = db;
    }
    async handleConnection(client) {
        const userId = client.handshake.query.userId;
        const token = client.handshake.auth.token;
        if (!userId || !token) {
            this.logger.warn(`Conexão rejeitada: usuário não autenticado`);
            client.disconnect();
            return;
        }
        this.connectedUsers.set(userId, {
            userId,
            socketId: client.id,
        });
        this.logger.log(`Usuário ${userId} conectado ao chat (Socket: ${client.id})`);
        this.server.emit('userOnline', { userId, timestamp: new Date() });
        this.broadcastOnlineUsers();
    }
    handleDisconnect(client) {
        const userId = Array.from(this.connectedUsers.entries()).find(([, user]) => user.socketId === client.id)?.[0];
        if (userId) {
            this.connectedUsers.delete(userId);
            this.logger.log(`Usuário ${userId} desconectado do chat`);
            this.server.emit('userOffline', { userId, timestamp: new Date() });
            this.broadcastOnlineUsers();
        }
    }
    async handleSendMessage(client, payload) {
        const senderId = client.handshake.query.userId;
        if (!senderId || !payload.receiverId || !payload.content) {
            client.emit('error', { message: 'Dados inválidos' });
            return;
        }
        try {
            const receiver = await this.db.user.findUnique({
                where: { id: payload.receiverId },
            });
            if (!receiver) {
                client.emit('error', { message: 'Receptor não encontrado' });
                return;
            }
            const message = await this.db.message.create({
                data: {
                    senderId,
                    receiverId: payload.receiverId,
                    content: payload.content,
                    adId: payload.adId,
                    isRead: false,
                    ...(payload.location && {
                        locationLat: payload.location.lat,
                        locationLng: payload.location.lng,
                        locationAddress: payload.location.address,
                    }),
                    ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            });
            this.logger.log(`Mensagem de ${senderId} para ${payload.receiverId}`);
            const receiverSocket = this.connectedUsers.get(payload.receiverId);
            if (receiverSocket) {
                this.server.to(receiverSocket.socketId).emit('messageReceived', {
                    id: message.id,
                    senderId: message.senderId,
                    content: message.content,
                    adId: message.adId,
                    sender: message.sender,
                    timestamp: message.createdAt,
                    location: payload.location,
                    imageUrl: payload.imageUrl,
                });
            }
            client.emit('messageSent', {
                id: message.id,
                timestamp: message.createdAt,
                status: receiverSocket ? 'delivered' : 'sent',
            });
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
            client.emit('error', { message: 'Erro ao enviar mensagem' });
        }
    }
    async handleMessageRead(client, payload) {
        const userId = client.handshake.query.userId;
        if (!userId || !payload.messageId) {
            return;
        }
        try {
            const message = await this.db.message.update({
                where: { id: payload.messageId },
                data: { isRead: true },
                include: {
                    sender: { select: { id: true } },
                },
            });
            const senderSocket = this.connectedUsers.get(message.senderId);
            if (senderSocket) {
                this.server.to(senderSocket.socketId).emit('messageReadNotification', {
                    messageId: message.id,
                    readBy: userId,
                    readAt: message.updatedAt,
                });
            }
            this.logger.debug(`Mensagem ${payload.messageId} marcada como lida por ${userId}`);
        }
        catch (error) {
            this.logger.error(`Erro ao marcar mensagem como lida: ${error.message}`);
        }
    }
    handleTyping(client, payload) {
        const senderId = client.handshake.query.userId;
        if (!senderId || !payload.receiverId) {
            return;
        }
        const receiverSocket = this.connectedUsers.get(payload.receiverId);
        if (receiverSocket) {
            this.server.to(receiverSocket.socketId).emit('userTyping', {
                userId: senderId,
                timestamp: new Date(),
            });
        }
    }
    handleStopTyping(client, payload) {
        const senderId = client.handshake.query.userId;
        if (!senderId || !payload.receiverId) {
            return;
        }
        const receiverSocket = this.connectedUsers.get(payload.receiverId);
        if (receiverSocket) {
            this.server.to(receiverSocket.socketId).emit('userStoppedTyping', {
                userId: senderId,
            });
        }
    }
    handleGetOnlineUsers(client) {
        const onlineUsers = Array.from(this.connectedUsers.values()).map((user) => user.userId);
        client.emit('onlineUsersList', { users: onlineUsers });
    }
    handlePing(client) {
        client.emit('pong', { timestamp: Date.now() });
    }
    broadcastOnlineUsers() {
        const onlineUsers = Array.from(this.connectedUsers.values()).map((user) => user.userId);
        this.server.emit('onlineUsersList', { users: onlineUsers });
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('messageRead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMessageRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stopTyping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleStopTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getOnlineUsers'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleGetOnlineUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handlePing", null);
exports.MessagesGateway = MessagesGateway = MessagesGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || '*',
            credentials: true,
        },
        namespace: 'messages',
    }),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map