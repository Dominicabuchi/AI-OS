import { HumanBrowser } from "@ai-os/browser-runtime";
import { BrowserConversation } from "../../core/browser-conversation";
import { LinkedInConfig } from "./config";

export class LinkedInConversation extends BrowserConversation {

  async open(id: string): Promise<void> {

    const conversations =
      this.human.locator(
        LinkedInConfig.selectors.conversationItem!
      );

    await conversations
      .nth(Number(id))
      .click();

  }

  async messages(): Promise<string[]> {

    return this.human.allText(
      LinkedInConfig.selectors.messageBubble!
    );

  }

  async lastMessage(): Promise<string | null> {

    const messages =
      await this.messages();

    if (messages.length === 0) {
      return null;
    }

    return messages[messages.length - 1];

  }

  async reply(
    message: string
  ): Promise<void> {

    await this.human.adaptiveType({

      platform: "linkedin",
      page: "messaging",
      action: "reply",
      description: "Reply message",
      value: message

    });

    await this.human.adaptivePress({

      platform: "linkedin",
      page: "messaging",
      action: "send-reply",
      description: "Reply message"

    }, "Enter");

  }

}
