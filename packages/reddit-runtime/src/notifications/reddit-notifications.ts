import { HumanBrowser } from "@ai-os/browser-runtime";

export class RedditNotifications {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open() {

    await this.human.goto(
      "https://www.reddit.com/notifications/"
    );

  }

}
