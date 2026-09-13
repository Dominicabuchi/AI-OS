import { HumanBrowser } from "@ai-os/browser-runtime";
import { BrowserConversation } from "../../core/browser-conversation";
import { XConfig } from "./config";

export class XConversation extends BrowserConversation {

  async open(id: string): Promise<void> {

    const conversations =
      this.human.locator(
        XConfig.selectors.conversationItem!
      );

    await conversations
      .nth(Number(id))
      .click();

  }

  async messages(): Promise<string[]> {

    return this.human.allText(
      XConfig.selectors.messageBubble!
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

      platform: "x",
      page: "messaging",
      action: "reply",
      description: "Reply message",
      value: message

    });

    await this.human.adaptivePress({

      platform: "x",
      page: "messaging",
      action: "send-reply",
      description: "Reply message"

    }, "Enter");

  }

}
