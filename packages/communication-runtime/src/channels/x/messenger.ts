import { HumanBrowser } from "@ai-os/browser-runtime";
import { Message } from "../../models/message";
import { BrowserMessenger } from "../../core/browser-messenger";
import { XConfig } from "./config";
import { XNavigator } from "./navigator";

export class XMessenger extends BrowserMessenger {

  private readonly navigator: XNavigator;

  constructor(
    human: HumanBrowser
  ) {
    super(human, XConfig);

    this.navigator =
      new XNavigator(human);
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

      platform: "x",
      page: "messaging",
      action: "focus-composer",
      description: "Message",

    });

  }

  protected async verifyDelivery(): Promise<boolean> {

    return this.human.exists(
      XConfig.selectors.messageBubble!
    );

  }

}
