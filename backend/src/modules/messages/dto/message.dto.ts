import { IsString, IsOptional, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para localização
 */
export class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;
}

/**
 * DTO para enviar mensagem
 */
export class SendMessageDto {
  @IsString()
  receiverId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  adId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

/**
 * DTO para resposta de mensagem
 */
export class MessageResponseDto {
  id: string;
  senderId: string;
  receiverId: string;
  adId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

/**
 * DTO para conversa
 */
export class ConversationDto {
  id: string;
  userId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}
