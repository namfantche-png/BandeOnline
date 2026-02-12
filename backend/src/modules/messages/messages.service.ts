import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';
import { SendMessageDto } from './dto/message.dto';

/**
 * Serviço de mensagens
 * Gerencia chat e comunicação entre usuários
 */
@Injectable()
export class MessagesService {
  constructor(private db: DatabaseService) {}

  /**
   * Envia mensagem para outro usuário
   */
  async sendMessage(senderId: string, sendMessageDto: SendMessageDto) {
    const { receiverId, content, adId, imageUrl, location } = sendMessageDto;

    // Verifica se receptor existe
    const receiver = await this.db.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Usuário receptor não encontrado');
    }

    // Verifica se é a mesma pessoa
    if (senderId === receiverId) {
      throw new BadRequestException('Você não pode enviar mensagem para si mesmo');
    }

    // Verifica se usuário está bloqueado
    const isBlocked = await this.isUserBlocked(receiverId, senderId);
    if (isBlocked) {
      throw new BadRequestException('Você não pode enviar mensagem para este usuário');
    }

    // Verifica se anúncio existe (se informado)
    if (adId) {
      const ad = await this.db.ad.findUnique({
        where: { id: adId },
      });

      if (!ad) {
        throw new NotFoundException('Anúncio não encontrado');
      }
    }

    // Cria mensagem
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

  /**
   * Obtém conversa entre dois usuários
   */
  async getConversation(userId: string, otherUserId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    // Verifica se outro usuário existe
    const otherUser = await this.db.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      throw new NotFoundException('Usuário não encontrado');
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

    // Marca mensagens como lidas
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

  /**
   * Obtém lista de conversas do usuário
   */
  async getConversations(userId: string) {
    // Busca todas as mensagens do usuário
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

    // Agrupa por conversa
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

      // Conta mensagens não lidas
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    }

    // Converte para array e ordena por data
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
    );

    return conversations;
  }

  /**
   * Obtém mensagens não lidas
   */
  async getUnreadMessages(userId: string) {
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

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId: string, userId: string) {
    const message = await this.db.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    if (message.receiverId !== userId) {
      throw new BadRequestException('Você não tem permissão para marcar esta mensagem');
    }

    return this.db.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  /**
   * Marca todas as mensagens de um usuário como lidas
   */
  async markAllAsRead(userId: string, senderId: string) {
    return this.db.message.updateMany({
      where: {
        receiverId: userId,
        senderId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  /**
   * Deleta mensagem
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.db.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrado');
    }

    if (message.senderId !== userId) {
      throw new BadRequestException('Você não tem permissão para deletar esta mensagem');
    }

    // Soft delete (marca como deletada)
    return this.db.message.update({
      where: { id: messageId },
      data: { content: '[Mensagem deletada]' },
    });
  }

  /**
   * Bloqueia usuário
   */
  async blockUser(userId: string, blockedUserId: string) {
    // Verifica se usuário existe
    const blockedUser = await this.db.user.findUnique({
      where: { id: blockedUserId },
    });

    if (!blockedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já está bloqueado
    const existingBlock = await (this.db as any).userBlock.findUnique({
      where: {
        blockerId_blockedUserId: {
          blockerId: userId,
          blockedUserId,
        },
      },
    });

    if (existingBlock) {
      throw new BadRequestException('Usuário já está bloqueado');
    }

    // Cria bloqueio
    const userBlock = await (this.db as any).userBlock.create({
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

  /**
   * Desbloqueia usuário
   */
  async unblockUser(userId: string, unblockedUserId: string) {
    // Verifica se bloqueio existe
    const userBlock = await (this.db as any).userBlock.findUnique({
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
      throw new NotFoundException('Usuário não está bloqueado');
    }

    // Remove bloqueio
    await (this.db as any).userBlock.delete({
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

  /**
   * Verifica se usuário está bloqueado
   */
  async isUserBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    if (!this.db) {
      console.error('DatabaseService not initialized in MessagesService');
      return false;
    }

    const block = await (this.db as any).userBlock.findUnique({
      where: {
        blockerId_blockedUserId: {
          blockerId,
          blockedUserId,
        },
      },
    });

    return !!block;
  }

  /**
   * Obtém lista de usuários bloqueados
   */
  async getBlockedUsers(userId: string) {
    const blockedUsers = await (this.db as any).userBlock.findMany({
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
}
