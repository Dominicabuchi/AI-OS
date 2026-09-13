import { BrowserChannel } from "../core/browser-channel";
import { BrowserManager } from "@ai-os/browser-runtime";
import { XRuntime } from "@ai-os/x-runtime";
import { Inbox } from "../models/inbox";
import { Conversation } from "../models/conversation";
import { Message, SendResult } from "../models/message";
import { MessageThread } from "../models/thread";

export class XChannel extends BrowserChannel {

  private runtime?: XRuntime;

  constructor(
    browser: BrowserManager
  ) {
    super(
      browser,
      "x"
    );
  }

  protected verification() {
    return {
      url: "https://x.com/home",
      selector: "main"
    };
  }


  async inbox(): Promise<Inbox> {

    await this.initialize();

    if (!this.runtime) {
      this.runtime = new XRuntime(this.getHuman());
    }

    const runtime = this.runtime;

    return {

      async listThreads(): Promise<MessageThread[]> {

        const conversations = await runtime.messaging.list();

        return conversations.map(c => ({
          id: c.id,
          participants: [c.sender],
          unread: c.text.toLowerCase().includes("unread"),
          lastMessage: c.text
        }));

      },

      async openThread(
        id: string
      ): Promise<MessageThread> {
        throw new Error("Not implemented.");
      },

      async readThread(
        id: string
      ): Promise<Conversation> {

        const messages = await runtime.messaging.readConversation(id);

        const thread = (await runtime.messaging.list())
          .find(t => t.id === id);

        return {
          threadId: id,
          participants: thread ? [thread.sender] : [],
          messages: messages.map((body, index) => ({
            id: String(index),
            threadId: id,
            sender: thread?.sender ?? "unknown",
            body,
            timestamp: new Date(),
            outgoing: false,
            read: true
          }))
        };

      },

      async search(
        query: string
      ): Promise<MessageThread[]> {

        const conversations =
          await runtime.messaging.searchConversations(query);

        return conversations.map(c => ({
          id: c.id,
          participants: [c.sender],
          unread: c.text.toLowerCase().includes("unread"),
          lastMessage: c.text
        }));

      },

      async unread(): Promise<MessageThread[]> {

        const conversations =
          await runtime.messaging.listUnread();

        return conversations.map(c => ({
          id: c.id,
          participants: [c.sender],
          unread: true,
          lastMessage: c.text
        }));

      }

    };

  }

  async send(
    message: Message
  ): Promise<SendResult> {

    await this.initialize();

    if (!this.runtime) {
      this.runtime = new XRuntime(this.getHuman());
    }

    await this.runtime.messaging.send(message.body);

    return {
      success: true
    };

  }

}
