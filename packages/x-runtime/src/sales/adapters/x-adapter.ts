import { MessagingAdapter } from "./messaging-adapter";
import { XMessaging } from "../../messaging/x-messaging";

export class XMessagingAdapter
implements MessagingAdapter {

  constructor(
    private readonly messaging: XMessaging,
  ) {}

  async send(
    conversationId: string,
    text: string,
  ): Promise<void> {

    await this.messaging.openConversation(
      conversationId,
    );

    await this.messaging.send(text);

  }

  async read(
    conversationId: string,
  ): Promise<string[]> {

    return this.messaging.readConversation(
      conversationId,
    );

  }

  async conversationExists(
    conversationId: string,
  ): Promise<boolean> {

    try {

      await this.messaging.openConversation(
        conversationId,
      );

      return true;

    } catch {

      return false;

    }

  }

  async openOrCreate(
    username: string,
  ): Promise<string> {

    const results =
      await this.messaging.searchConversations(
        username,
      );

    if (results.length > 0) {
      return results[0].id;
    }

    throw new Error(
      `Conversation with '${username}' does not exist. Conversation creation is not implemented yet.`
    );

  }

  async typing(
    conversationId: string,
  ): Promise<void> {

    await this.messaging.openConversation(
      conversationId,
    );

  }

  async markRead(
    conversationId: string,
  ): Promise<void> {

    await this.messaging.openConversation(
      conversationId,
    );

  }

  async archive(
    conversationId: string,
  ): Promise<void> {

    await this.messaging.openConversation(
      conversationId,
    );

    await this.messaging.delete();

  }

}
