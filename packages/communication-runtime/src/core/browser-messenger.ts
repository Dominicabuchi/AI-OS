import { HumanBrowser } from "@ai-os/browser-runtime";
import { Message, SendResult } from "../models/message";
import { PlatformConfig } from "./platform/platform-config";

export abstract class BrowserMessenger {

  constructor(
    protected readonly human: HumanBrowser,
    protected readonly config: PlatformConfig
  ) {}

  protected abstract openComposer(): Promise<void>;

  protected abstract openThread(
    threadId: string
  ): Promise<void>;

  protected abstract startConversation(
    message: Message
  ): Promise<void>;

  protected abstract focusComposer(): Promise<void>;

  protected abstract verifyDelivery(): Promise<boolean>;

  async send(
    message: Message
  ): Promise<SendResult> {

    await this.openComposer();

    return this.sendInternal(message);

  }

  async reply(
    threadId: string,
    message: Message
  ): Promise<SendResult> {

    await this.openThread(threadId);

    return this.sendInternal(message);

  }

  async newConversation(
    message: Message
  ): Promise<SendResult> {

    await this.startConversation(message);

    return this.sendInternal(message);

  }

  protected async sendInternal(
    message: Message
  ): Promise<SendResult> {

    await this.focusComposer();

    await this.human.adaptiveType({

      platform: this.config.name,
      page: "messaging",
      action: "compose-message",
      description: "Message",
      value: message.body

    });

    await this.human.adaptivePress({

      platform: this.config.name,
      page: "messaging",
      action: "send-message",
      description: "Message"

    }, "Enter");

    return {
      success: await this.verifyDelivery()
    };

  }

}
