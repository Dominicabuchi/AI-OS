
import {
  BrowserManager,
  HumanBrowser
} from "@ai-os/browser-runtime";

export interface GmailBrowserSendPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface GmailBrowserReplyPayload {
  body: string;
  threadId?: string;
}

export class GmailBrowserFallback {

  private readonly browser: BrowserManager;

  constructor(
    browser?: BrowserManager
  ) {
    this.browser =
      browser ?? new BrowserManager();
  }

  private async initialize(): Promise<HumanBrowser> {

    if (!this.browser.isRunning()) {

      await this.browser.start({
        profile: "gmail",
        headless: false
      });

    } else if (
      this.browser.getProfile() !== "gmail"
    ) {

      await this.browser.useProfile("gmail");
    }

    const human =
      this.browser.getHumanBrowser();

    await human.goto(
      "https://mail.google.com/mail/u/0/#inbox"
    );

    return human;
  }

  async send(
    payload: GmailBrowserSendPayload
  ): Promise<unknown> {

    const human =
      await this.initialize();

    await human.adaptiveClick({
      platform: "gmail",
      page: "mail",
      action: "compose",
      description: "Compose"
    });

    await human.adaptiveFill(
      {
        platform: "gmail",
        page: "compose",
        action: "recipient",
        description: "To recipients"
      },
      payload.to
    );

    await human.adaptiveFill(
      {
        platform: "gmail",
        page: "compose",
        action: "subject",
        description: "Subject"
      },
      payload.subject
    );

    await human.adaptiveFill(
      {
        platform: "gmail",
        page: "compose",
        action: "body",
        description: "Message body"
      },
      payload.body
    );

    await human.adaptiveClick({
      platform: "gmail",
      page: "compose",
      action: "send",
      description: "Send"
    });

    return {
      success: true,
      provider: "browser",
      fallback: true
    };
  }

  async reply(
    payload: GmailBrowserReplyPayload
  ): Promise<unknown> {

    const human =
      await this.initialize();

    if (payload.threadId) {

      await human.goto(
        `https://mail.google.com/mail/u/0/#inbox/${payload.threadId}`
      );

    }

    await human.adaptiveClick({
      platform: "gmail",
      page: "thread",
      action: "reply",
      description: "Reply"
    });

    await human.adaptiveFill(
      {
        platform: "gmail",
        page: "thread",
        action: "reply-body",
        description: "Message body"
      },
      payload.body
    );

    await human.adaptiveClick({
      platform: "gmail",
      page: "thread",
      action: "send-reply",
      description: "Send"
    });

    return {
      success: true,
      provider: "browser",
      fallback: true
    };
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
