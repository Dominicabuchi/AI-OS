import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditQueue } from "../queue";

export interface RedditMessage {
  username: string;
  subject?: string;
  body: string;
}

export interface RedditDraft {
  username: string;
  subject?: string;
  body: string;
}

export interface RedditConversation {
  id: string;
}

export class RedditMessages {

  constructor(
    private readonly human: HumanBrowser,
    private readonly queue?: RedditQueue
  ) {}

  async inbox() {

    await this.human.goto(
      "https://www.reddit.com/message/inbox/"
    );

  }

  async unread() {

    await this.human.goto(
      "https://www.reddit.com/message/unread/"
    );

  }

  async conversation(
    id: string
  ) {

    await this.human.goto(
      `https://www.reddit.com/message/messages/${encodeURIComponent(id)}`
    );

  }

  async search(
    query: string
  ) {

    await this.human.goto(
      `https://www.reddit.com/message/search/?q=${encodeURIComponent(query)}`
    );

  }

  async messages(
    conversationId: string
  ) {

    return this.conversation(
      conversationId
    );

  }

  async reply(
    conversationId: string,
    text: string
  ) {

    await this.conversation(
      conversationId
    );

    await this.human.adaptiveFill(
      {
        platform: "reddit",
        page: "message-conversation",
        action: "reply",
        description: "Conversation reply"
      },
      text
    );

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "message-conversation",
      action: "send",
      description: "Send reply"
    });

  }

  async markRead(
    conversationId: string
  ) {

    await this.conversation(
      conversationId
    );

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "message-conversation",
      action: "mark-read",
      description: "Mark conversation as read"
    });

  }

  async archive(
    conversationId: string
  ) {

    await this.conversation(
      conversationId
    );

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "message-conversation",
      action: "archive",
      description: "Archive conversation"
    });

  }

  async compose(
    username: string
  ) {

    await this.human.goto(
      `https://www.reddit.com/message/compose/?to=${encodeURIComponent(username)}`
    );

  }

  async send(
    message: RedditMessage
  ) {

    await this.compose(
      message.username
    );

    if (message.subject) {

      await this.human.adaptiveFill(
        {
          platform: "reddit",
          page: "message-compose",
          action: "subject",
          description: "Message subject"
        },
        message.subject
      );

    }

    await this.human.adaptiveFill(
      {
        platform: "reddit",
        page: "message-compose",
        action: "body",
        description: "Message body"
      },
      message.body
    );

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "message-compose",
      action: "send",
      description: "Send message"
    });

  }

  async sendBulk(
    messages: RedditMessage[]
  ) {

    if (!this.queue) {
      return {
        success: false,
        status: "unavailable",
        capability: "reddit.dm",
        reason: "Reddit direct messaging is unavailable in the current runtime.",
        retryable: false
      };
    }

    for (const message of messages) {

      this.queue.add({

        id:
          `reddit-message-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`,

        account: "default",

        action: "send-message",

        payload: message

      });

    }

  }

  async draft(
    draft: RedditDraft
  ) {

    await this.compose(
      draft.username
    );

    if (draft.subject) {

      await this.human.adaptiveFill(
        {
          platform: "reddit",
          page: "message-compose",
          action: "subject",
          description: "Draft subject"
        },
        draft.subject
      );

    }

    await this.human.adaptiveFill(
      {
        platform: "reddit",
        page: "message-compose",
        action: "body",
        description: "Draft body"
      },
      draft.body
    );

  }

}
