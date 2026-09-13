export interface ConversationMessage {

  id: string;

  threadId: string;

  sender: string;

  body: string;

  timestamp: Date;

  outgoing: boolean;

  read: boolean;

}

export interface Conversation {

  threadId: string;

  participants: string[];

  messages: ConversationMessage[];

}
