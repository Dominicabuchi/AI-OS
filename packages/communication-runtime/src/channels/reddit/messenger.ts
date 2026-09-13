import { HumanBrowser } from "@ai-os/browser-runtime";
import { Message } from "../../models/message";
import { BrowserMessenger } from "../../core/browser-messenger";
import { LinkedInConfig } from "./config";
import { LinkedInNavigator } from "./navigator";

export class LinkedInMessenger extends BrowserMessenger {

  private readonly navigator: LinkedInNavigator;

  constructor(
    human: HumanBrowser
  ) {
    super(human, LinkedInConfig);

    this.navigator =
      new LinkedInNavigator(human);
  }

  protected async openComposer(): Promise<void> {

    await this.navigator.inbox();

  }

  protected async openThread(
    threadId: string
  ): Promise<void> {

    await this.navigator.openThread(threadId);

  }

  protected async startConversation(
    _message: Message
  ): Promise<void> {

    // Placeholder.
    // LinkedIn Runtime will implement the platform-specific
    // "new message" flow using the adaptive browser layer.
    await this.openComposer();

  }

  protected async focusComposer(): Promise<void> {

    await this.human.adaptiveClick({

      platform: "linkedin",
      page: "messaging",
      action: "focus-composer",
      description: "Message",

    });

  }

  protected async verifyDelivery(): Promise<boolean> {

    return this.human.exists(
      LinkedInConfig.selectors.messageBubble!
    );

  }

}
