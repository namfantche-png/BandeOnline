'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { messagesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { SocketEvents } from '@/lib/socket';
import { AdImage } from '@/components/AdImage';
import Header from '@/components/Header';
import { BackButton } from '@/components/BackButton';

interface Conversation {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// Formato da API
interface ApiConversation {
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  imageUrl?: string;
  location?: { lat: number; lng: number; address?: string };
  ad?: {
    id: string;
    title: string;
    images: string[];
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { socket, isConnected, onlineUsers, sendMessage: sendSocketMessage, sendTyping, stopTyping, markMessageAsRead } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const response = await messagesApi.getConversations();
      const apiConvs: ApiConversation[] = Array.isArray(response.data) ? response.data : [];
      const mapped: Conversation[] = apiConvs.map((c) => {
        const parts = (c.otherUserName || 'Utilizador').split(' ');
        return {
          id: c.otherUserId,
          firstName: parts[0] || 'Utilizador',
          lastName: parts.slice(1).join(' ') || '',
          avatar: c.otherUserAvatar,
          lastMessage: c.lastMessage || '',
          lastMessageAt: c.lastMessageTime || '',
          unreadCount: c.unreadCount ?? 0,
        };
      });
      setConversations(mapped);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error('Erro ao carregar conversas:', error);
      }
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (userId: string) => {
      try {
        const response = await messagesApi.getConversation(userId);
        const msgList = response.data?.data ?? response.data ?? [];
        const list = Array.isArray(msgList) ? msgList : [];
        setMessages(list);

        list.forEach((msg: Message) => {
          if (msg.senderId === userId && !msg.isRead && msg.id) {
            markMessageAsRead(msg.id);
          }
        });
      } catch (error: any) {
        if (error?.response?.status !== 401) {
          console.error('Erro ao carregar mensagens:', error);
        }
        setMessages([]);
      }
    },
    [markMessageAsRead]
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  useEffect(() => {
    if (isAuthenticated && selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [isAuthenticated, selectedUserId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Configurar listeners do WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessageReceived = (data: any) => {
      if (data.senderId === selectedUserId) {
        setMessages((prev) => [...prev, data]);
        if (data.id) markMessageAsRead(data.id);
      }
      loadConversations();
    };

    const handleMessageSent = () => {
      if (selectedUserId) loadMessages(selectedUserId);
      loadConversations();
    };

    const handleUserTyping = (data: { userId: string }) => {
      if (data.userId === selectedUserId) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
      }
    };

    const handleUserStoppedTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socket.on(SocketEvents.MESSAGE_RECEIVED, handleMessageReceived);
    socket.on(SocketEvents.MESSAGE_SENT, handleMessageSent);
    socket.on(SocketEvents.USER_TYPING, handleUserTyping);
    socket.on(SocketEvents.USER_STOPPED_TYPING, handleUserStoppedTyping);

    return () => {
      socket.off(SocketEvents.MESSAGE_RECEIVED, handleMessageReceived);
      socket.off(SocketEvents.MESSAGE_SENT, handleMessageSent);
      socket.off(SocketEvents.USER_TYPING, handleUserTyping);
      socket.off(SocketEvents.USER_STOPPED_TYPING, handleUserStoppedTyping);
    };
  }, [socket, isConnected, selectedUserId, markMessageAsRead, loadConversations, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedUserId) {
      sendTyping(selectedUserId);
      
      // Limpa timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Para de digitar após 2 segundos sem digitar
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedUserId);
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      // Para de digitar
      if (selectedUserId) {
        stopTyping(selectedUserId);
      }

      // Envia via WebSocket se conectado, senão via REST
      if (isConnected && socket) {
        sendSocketMessage(selectedUserId, messageContent);
        // Adiciona mensagem otimisticamente
        setMessages((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            content: messageContent,
            senderId: user!.id,
            receiverId: selectedUserId,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        // Fallback para REST API
        await messagesApi.send({
          receiverId: selectedUserId,
          content: messageContent,
        });
        loadMessages(selectedUserId);
      }
      
      loadConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('pt-GW', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return d.toLocaleDateString('pt-GW', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('pt-GW', { day: '2-digit', month: '2-digit' });
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedUserId);
  const isUserOnline = selectedUserId ? onlineUsers.includes(selectedUserId) : false;
  const isUserTyping = selectedUserId ? typingUsers.has(selectedUserId) : false;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        {/* Indicador de conexão */}
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isConnected ? '🟢 Conectado' : '🟡 Reconectando...'}
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="flex h-full">
            {/* Lista de conversas */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mensagens</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p>Nenhuma conversa ainda</p>
                    <p className="text-sm">Encontre um anúncio e envie uma mensagem!</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isOnline = onlineUsers.includes(conv.id);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedUserId(conv.id)}
                        className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition ${
                          selectedUserId === conv.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {conv.avatar ? (
                              <AdImage
                                src={conv.avatar}
                                alt={conv.firstName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-medium text-blue-600">
                                {(conv.firstName || '?').charAt(0)}
                              </span>
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex justify-between items-baseline">
                            <p className="font-medium text-gray-900 truncate">
                              {conv.firstName} {conv.lastName}
                            </p>
                            <span className="text-xs text-gray-500">{formatTime(conv.lastMessageAt)}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Área de chat */}
            <div className="flex-1 flex flex-col">
              {selectedUserId ? (
                <>
                  {/* Header do chat */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {selectedConversation?.avatar ? (
                            <AdImage
                              src={selectedConversation.avatar}
                              alt={selectedConversation.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-blue-600">
                              {(selectedConversation?.firstName ?? '?').charAt(0)}
                            </span>
                          )}
                        </div>
                        {isUserOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedConversation?.firstName} {selectedConversation?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isUserOnline ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderId === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.ad && (
                            <div className="mb-2 p-2 bg-white bg-opacity-20 rounded text-sm">
                              <p className="font-medium">Re: {msg.ad.title}</p>
                            </div>
                          )}
                          {msg.imageUrl && (
                            <div className="mb-2">
                              <AdImage
                                src={msg.imageUrl}
                                alt="Compartilhada"
                                className="rounded-lg max-w-full h-auto"
                              />
                            </div>
                          )}
                          {msg.location && (
                            <div className="mb-2 p-2 bg-white bg-opacity-20 rounded text-sm">
                              <p className="font-medium">📍 Localização compartilhada</p>
                              {msg.location.address && (
                                <p className="text-xs mt-1">{msg.location.address}</p>
                              )}
                              <a
                                href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline mt-1 block"
                              >
                                Ver no mapa
                              </a>
                            </div>
                          )}
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                            {msg.senderId === user?.id && msg.isRead && ' ✓✓'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isUserTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de mensagem */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Escreva uma mensagem..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-lg font-medium">Selecione uma conversa</p>
                    <p className="text-sm">Escolha uma conversa da lista para começar a conversar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
