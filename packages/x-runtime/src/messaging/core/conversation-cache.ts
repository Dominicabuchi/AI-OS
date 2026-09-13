import { XConversation } from "./conversation";

export class ConversationCache {

  private readonly conversations =
    new Map<string, XConversation>();

  set(conversation: XConversation) {
    this.conversations.set(
      conversation.id,
      conversation
    );
  }

  get(id: string) {
    return this.conversations.get(id);
  }

  all() {
    return [...this.conversations.values()];
  }

  clear() {
    this.conversations.clear();
  }

}
