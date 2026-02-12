export declare class LocationDto {
    lat: number;
    lng: number;
    address?: string;
}
export declare class SendMessageDto {
    receiverId: string;
    content: string;
    adId?: string;
    imageUrl?: string;
    location?: LocationDto;
}
export declare class MessageResponseDto {
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
export declare class ConversationDto {
    id: string;
    userId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
}
