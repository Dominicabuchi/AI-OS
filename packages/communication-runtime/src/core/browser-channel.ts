import {
  BrowserManager,
  HumanBrowser,
  Platform
} from "@ai-os/browser-runtime";

import {
  CommunicationChannel
} from "./router";

import {
  Message,
  SendResult
} from "../models/message";

import { Inbox } from "../models/inbox";

import {
  PlatformVerification
} from "./platform-verification";

export abstract class BrowserChannel
  implements CommunicationChannel {

  protected human?: HumanBrowser;

  constructor(
    protected readonly browser: BrowserManager,
    protected readonly platform: Platform
  ) {}

  protected abstract verification():
    PlatformVerification;

  protected async initialize(): Promise<void> {

    await this.browser.usePlatform(
      this.platform
    );

    const sessions =
      this.browser.getSessionManager();

    const page =
      this.browser.getPage();

    const authenticated =
      await sessions.verifyLogin(
        page,
        this.verification()
      );

    if (!authenticated) {

      throw new Error(
        `Not logged into ${this.platform}.`
      );

    }

    this.human =
      this.browser.getHumanBrowser();

  }

  protected getHuman(): HumanBrowser {

    if (!this.human)
      throw new Error(
        "Browser not initialized."
      );

    return this.human;

  }

  abstract inbox(): Promise<Inbox>;

  abstract send(
    message: Message
  ): Promise<SendResult>;

}
