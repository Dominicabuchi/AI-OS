import { BrowserChannel } from "../core/browser-channel";
import { Inbox } from "../models/inbox";
import { Message, SendResult } from "../models/message";
import { BrowserManager } from "@ai-os/browser-runtime";

import { LinkedInInbox } from "./linkedin/inbox";
import { LinkedInMessenger } from "./linkedin/messenger";

export class LinkedInChannel extends BrowserChannel {

  constructor(
    browser: BrowserManager
  ) {
    super(
      browser,
      "linkedin"
    );
  }

  protected verification() {
    return {
      url: "https://www.linkedin.com/feed/",
      selector: "nav.global-nav"
    };
  }

  async inbox(): Promise<Inbox> {

    await this.initialize();

    return new LinkedInInbox(
      this.getHuman()
    );

  }

  async send(
    message: Message
  ): Promise<SendResult> {

    await this.initialize();

    return new LinkedInMessenger(
      this.getHuman()
    ).send(message);

  }

}
