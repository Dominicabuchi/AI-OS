export interface MessageThread {
  id: string;

  participants: string[];

  unread: boolean;

  lastMessage?: string;

  lastActivity?: Date;
}
