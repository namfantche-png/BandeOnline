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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const database_config_1 = require("../../config/database.config");
let MessagesService = class MessagesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async sendMessage(senderId, sendMessageDto) {
        const { receiverId, content, adId, imageUrl, location } = sendMessageDto;
        const receiver = await this.db.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            throw new common_1.NotFoundException('Usuário receptor não encontrado');
        }
        if (senderId === receiverId) {
            throw new common_1.BadRequestException('Você não pode enviar mensagem para si mesmo');
        }
        const isBlocked = await this.isUserBlocked(receiverId, senderId);
        if (isBlocked) {
            throw new common_1.BadRequestException('Você não pode enviar mensagem para este usuário');
        }
        if (adId) {
            const ad = await this.db.ad.findUnique({
                where: { id: adId },
            });
            if (!ad) {
                throw new common_1.NotFoundException('Anúncio não encontrado');
            }
        }
        const message = await this.db.message.create({
            data: {
                senderId,
                receiverId,
                content,
                adId,
                ...(imageUrl && { imageUrl }),
                ...(location && {
                    locationLat: location.lat,
                    locationLng: location.lng,
                    locationAddress: location.address,
                }),
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
        return message;
    }
    async getConversation(userId, otherUserId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const otherUser = await this.db.user.findUnique({
            where: { id: otherUserId },
        });
        if (!otherUser) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const [messages, total] = await Promise.all([
            this.db.message.findMany({
                where: {
                    OR: [
                        { senderId: userId, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: userId },
                    ],
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
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.db.message.count({
                where: {
                    OR: [
                        { senderId: userId, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: userId },
                    ],
                },
            }),
        ]);
        await this.db.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                isRead: false,
            },
            data: { isRead: true },
        });
        return {
            data: messages.reverse(),
            otherUser: {
                id: otherUser.id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                avatar: otherUser.avatar,
            },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getConversations(userId) {
        const messages = await this.db.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
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
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const conversationsMap = new Map();
        for (const message of messages) {
            const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
            const otherUser = message.senderId === userId ? message.receiver : message.sender;
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    otherUserId,
                    otherUserName: `${otherUser.firstName} ${otherUser.lastName}`,
                    otherUserAvatar: otherUser.avatar,
                    lastMessage: message.content,
                    lastMessageTime: message.createdAt,
                    unreadCount: 0,
                });
            }
            if (message.receiverId === userId && !message.isRead) {
                conversationsMap.get(otherUserId).unreadCount += 1;
            }
        }
        const conversations = Array.from(conversationsMap.values()).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        return conversations;
    }
    async getUnreadMessages(userId) {
        const unreadMessages = await this.db.message.findMany({
            where: {
                receiverId: userId,
                isRead: false,
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
            orderBy: { createdAt: 'desc' },
        });
        return unreadMessages;
    }
    async markAsRead(messageId, userId) {
        const message = await this.db.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Mensagem não encontrada');
        }
        if (message.receiverId !== userId) {
            throw new common_1.BadRequestException('Você não tem permissão para marcar esta mensagem');
        }
        return this.db.message.update({
            where: { id: messageId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId, senderId) {
        return this.db.message.updateMany({
            where: {
                receiverId: userId,
                senderId,
                isRead: false,
            },
            data: { isRead: true },
        });
    }
    async deleteMessage(messageId, userId) {
        const message = await this.db.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Mensagem não encontrado');
        }
        if (message.senderId !== userId) {
            throw new common_1.BadRequestException('Você não tem permissão para deletar esta mensagem');
        }
        return this.db.message.update({
            where: { id: messageId },
            data: { content: '[Mensagem deletada]' },
        });
    }
    async blockUser(userId, blockedUserId) {
        const blockedUser = await this.db.user.findUnique({
            where: { id: blockedUserId },
        });
        if (!blockedUser) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const existingBlock = await this.db.userBlock.findUnique({
            where: {
                blockerId_blockedUserId: {
                    blockerId: userId,
                    blockedUserId,
                },
            },
        });
        if (existingBlock) {
            throw new common_1.BadRequestException('Usuário já está bloqueado');
        }
        const userBlock = await this.db.userBlock.create({
            data: {
                blockerId: userId,
                blockedUserId,
            },
            include: {
                blockedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            message: `Usuário ${blockedUser.firstName} ${blockedUser.lastName} bloqueado com sucesso`,
            blockedUserId,
            blockedUser: userBlock.blockedUser,
        };
    }
    async unblockUser(userId, unblockedUserId) {
        const userBlock = await this.db.userBlock.findUnique({
            where: {
                blockerId_blockedUserId: {
                    blockerId: userId,
                    blockedUserId: unblockedUserId,
                },
            },
            include: {
                blockedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!userBlock) {
            throw new common_1.NotFoundException('Usuário não está bloqueado');
        }
        await this.db.userBlock.delete({
            where: {
                blockerId_blockedUserId: {
                    blockerId: userId,
                    blockedUserId: unblockedUserId,
                },
            },
        });
        return {
            message: `Usuário ${userBlock.blockedUser.firstName} ${userBlock.blockedUser.lastName} desbloqueado com sucesso`,
            unblockedUserId,
        };
    }
    async isUserBlocked(blockerId, blockedUserId) {
        if (!this.db) {
            console.error('DatabaseService not initialized in MessagesService');
            return false;
        }
        const block = await this.db.userBlock.findUnique({
            where: {
                blockerId_blockedUserId: {
                    blockerId,
                    blockedUserId,
                },
            },
        });
        return !!block;
    }
    async getBlockedUsers(userId) {
        const blockedUsers = await this.db.userBlock.findMany({
            where: { blockerId: userId },
            include: {
                blockedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return blockedUsers.map((block) => ({
            id: block.id,
            blockedUser: block.blockedUser,
            createdAt: block.createdAt,
        }));
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_config_1.DatabaseService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map