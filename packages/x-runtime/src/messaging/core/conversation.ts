export interface XParticipant {
  id: string;
  username?: string;
  name?: string;
}

export interface XMessageRecord {
  id: string;
  conversationId: string;

  senderId: string;
  recipientId?: string;

  text: string;

  createdAt?: string;

  read?: boolean;

  raw?: any;
}

export interface XConversation {

  id: string;

  participant: XParticipant;

  messages: XMessageRecord[];

  lastMessage?: XMessageRecord;

  unreadCount: number;

  lastActivity?: string;

  archived?: boolean;

}
