import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * Cria conexão WebSocket para chat em tempo real
 */
export function createSocket(userId: string, token: string): Socket {
  return io(`${SOCKET_URL}/messages`, {
    query: {
      userId,
    },
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
}

/**
 * Eventos do WebSocket
 */
export enum SocketEvents {
  // Cliente → Servidor
  SEND_MESSAGE = 'sendMessage',
  TYPING = 'typing',
  STOP_TYPING = 'stopTyping',
  MESSAGE_READ = 'messageRead',
  GET_ONLINE_USERS = 'getOnlineUsers',
  PING = 'ping',

  // Servidor → Cliente
  MESSAGE_RECEIVED = 'messageReceived',
  MESSAGE_SENT = 'messageSent',
  MESSAGE_READ_NOTIFICATION = 'messageReadNotification',
  USER_TYPING = 'userTyping',
  USER_STOPPED_TYPING = 'userStoppedTyping',
  USER_ONLINE = 'userOnline',
  USER_OFFLINE = 'userOffline',
  ONLINE_USERS_LIST = 'onlineUsersList',
  PONG = 'pong',
  ERROR = 'error',
}
