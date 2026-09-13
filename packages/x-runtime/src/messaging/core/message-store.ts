import { XMessageRecord } from "./conversation";

export class MessageStore {

  private readonly messages =
    new Map<string, XMessageRecord>();

  set(message: XMessageRecord) {
    this.messages.set(message.id, message);
  }

  get(id: string) {
    return this.messages.get(id);
  }

  all() {
    return [...this.messages.values()];
  }

  byConversation(conversationId: string) {
    return this.all().filter(
      m => m.conversationId === conversationId
    );
  }

  clear() {
    this.messages.clear();
  }

}
