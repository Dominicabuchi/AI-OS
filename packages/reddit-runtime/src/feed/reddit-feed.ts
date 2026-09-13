import { HumanBrowser } from "@ai-os/browser-runtime";

export class RedditFeed {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async home() {
    await this.human.goto("https://www.reddit.com/");
  }

  async refresh() {
    await this.human.page.reload({
      waitUntil: "networkidle"
    });
  }

}
