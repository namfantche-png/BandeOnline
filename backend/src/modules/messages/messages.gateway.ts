import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { DatabaseService } from '../../config/database.config';

interface ConnectedUser {
  userId: string;
  socketId: string;
}

/**
 * WebSocket Gateway para Chat em Tempo Real
 * Gerencia conexões e mensagens em tempo real
 * URL: ws://localhost:3000/socket.io
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
  namespace: 'messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(private db: DatabaseService) {}

  /**
   * Quando usuário se conecta
   */
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const token = client.handshake.auth.token as string;

    if (!userId || !token) {
      this.logger.warn(`Conexão rejeitada: usuário não autenticado`);
      client.disconnect();
      return;
    }

    // Valida token (você pode adicionar validação JWT aqui)
    // const user = await validateToken(token);
    // if (!user) {
    //   client.disconnect();
    //   return;
    // }

    this.connectedUsers.set(userId, {
      userId,
      socketId: client.id,
    });

    this.logger.log(`Usuário ${userId} conectado ao chat (Socket: ${client.id})`);

    // Notifica outros usuários que este usuário está online
    this.server.emit('userOnline', { userId, timestamp: new Date() });

    // Envia lista de usuários online
    this.broadcastOnlineUsers();
  }

  /**
   * Quando usuário se desconecta
   */
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries()).find(
      ([, user]) => user.socketId === client.id,
    )?.[0];

    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Usuário ${userId} desconectado do chat`);

      // Notifica outros usuários que este usuário está offline
      this.server.emit('userOffline', { userId, timestamp: new Date() });

      // Atualiza lista de usuários online
      this.broadcastOnlineUsers();
    }
  }

  /**
   * Envia mensagem para outro usuário
   * @event sendMessage
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      receiverId: string;
      content: string;
      adId?: string;
      location?: { lat: number; lng: number; address?: string };
      imageUrl?: string;
    },
  ) {
    const senderId = client.handshake.query.userId as string;

    if (!senderId || !payload.receiverId || !payload.content) {
      client.emit('error', { message: 'Dados inválidos' });
      return;
    }

    try {
      // Valida se receptor existe
      const receiver = await this.db.user.findUnique({
        where: { id: payload.receiverId },
      });

      if (!receiver) {
        client.emit('error', { message: 'Receptor não encontrado' });
        return;
      }

      // Cria mensagem no banco
      const message = await this.db.message.create({
        data: {
          senderId,
          receiverId: payload.receiverId,
          content: payload.content,
          adId: payload.adId,
          isRead: false,
          // Campos adicionais para localização e imagens
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

      // Envia mensagem para o receptor se estiver online
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

      // Confirma ao emissor que a mensagem foi enviada
      client.emit('messageSent', {
        id: message.id,
        timestamp: message.createdAt,
        status: receiverSocket ? 'delivered' : 'sent',
      });
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
      client.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  }

  /**
   * Marca mensagem como lida
   * @event messageRead
   */
  @SubscribeMessage('messageRead')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string },
  ) {
    const userId = client.handshake.query.userId as string;

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

      // Notifica o emissor que sua mensagem foi lida
      const senderSocket = this.connectedUsers.get(message.senderId);
      if (senderSocket) {
        this.server.to(senderSocket.socketId).emit('messageReadNotification', {
          messageId: message.id,
          readBy: userId,
          readAt: message.updatedAt,
        });
      }

      this.logger.debug(`Mensagem ${payload.messageId} marcada como lida por ${userId}`);
    } catch (error) {
      this.logger.error(`Erro ao marcar mensagem como lida: ${error.message}`);
    }
  }

  /**
   * Envia indicador de digitação
   * @event typing
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string },
  ) {
    const senderId = client.handshake.query.userId as string;

    if (!senderId || !payload.receiverId) {
      return;
    }

    // Envia indicador de digitação apenas para o receptor
    const receiverSocket = this.connectedUsers.get(payload.receiverId);
    if (receiverSocket) {
      this.server.to(receiverSocket.socketId).emit('userTyping', {
        userId: senderId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Parou de digitar
   * @event stopTyping
   */
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string },
  ) {
    const senderId = client.handshake.query.userId as string;

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

  /**
   * Lista usuários online
   * @event getOnlineUsers
   */
  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsers = Array.from(this.connectedUsers.values()).map((user) => user.userId);
    client.emit('onlineUsersList', { users: onlineUsers });
  }

  /**
   * Envia heartbeat para manter conexão ativa
   * @event ping
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  /**
   * Transmite lista de usuários online para todos
   */
  private broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.connectedUsers.values()).map((user) => user.userId);
    this.server.emit('onlineUsersList', { users: onlineUsers });
  }
}
