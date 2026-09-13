import { HumanBrowser } from "@ai-os/browser-runtime";

export class XBrowserActions {

  constructor(
    private readonly human: HumanBrowser,
  ) {}

  async reply() {

    await this.human.adaptiveClick({
      platform: "x",
      page: "feed",
      action: "reply",
      description: "Reply to current post",
    });

  }

  async repost() {

    await this.human.adaptiveClick({
      platform: "x",
      page: "feed",
      action: "repost",
      description: "Repost current post",
    });

  }

  async quote() {

    await this.human.adaptiveClick({
      platform: "x",
      page: "feed",
      action: "quote",
      description: "Quote current post",
    });

  }

  async bookmark() {

    await this.human.adaptiveClick({
      platform: "x",
      page: "feed",
      action: "bookmark",
      description: "Bookmark current post",
    });

  }

  async unbookmark() {

    await this.human.adaptiveClick({
      platform: "x",
      page: "feed",
      action: "remove-bookmark",
      description: "Remove bookmark",
    });

  }

}
