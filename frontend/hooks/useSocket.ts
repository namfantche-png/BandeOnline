import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { createSocket, SocketEvents } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  sendMessage: (receiverId: string, content: string, adId?: string) => void;
  sendTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  markMessageAsRead: (messageId: string) => void;
}

/**
 * Hook para gerenciar conexão WebSocket
 */
export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!user?.id) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return;

    const newSocket = createSocket(user.id, token);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket conectado');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket desconectado');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error);
      setIsConnected(false);
    });

    newSocket.on(SocketEvents.ONLINE_USERS_LIST, (data: { users: string[] }) => {
      setOnlineUsers(data.users);
    });

    newSocket.on(SocketEvents.USER_ONLINE, (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    newSocket.on(SocketEvents.USER_OFFLINE, (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  const sendMessage = useCallback(
    (receiverId: string, content: string, adId?: string) => {
      if (!socket || !isConnected) return;

      socket.emit(SocketEvents.SEND_MESSAGE, {
        receiverId,
        content,
        adId,
      });
    },
    [socket, isConnected]
  );

  const sendTyping = useCallback(
    (receiverId: string) => {
      if (!socket || !isConnected) return;

      socket.emit(SocketEvents.TYPING, { receiverId });

      // Limpa timeout anterior
      const existingTimeout = typingTimeoutRef.current.get(receiverId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Para de digitar após 3 segundos
      const timeout = setTimeout(() => {
        stopTyping(receiverId);
      }, 3000);

      typingTimeoutRef.current.set(receiverId, timeout);
    },
    [socket, isConnected]
  );

  const stopTyping = useCallback(
    (receiverId: string) => {
      if (!socket || !isConnected) return;

      socket.emit(SocketEvents.STOP_TYPING, { receiverId });

      const timeout = typingTimeoutRef.current.get(receiverId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutRef.current.delete(receiverId);
      }
    },
    [socket, isConnected]
  );

  const markMessageAsRead = useCallback(
    (messageId: string) => {
      if (!socket || !isConnected) return;

      socket.emit(SocketEvents.MESSAGE_READ, { messageId });
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    sendTyping,
    stopTyping,
    markMessageAsRead,
  };
}
