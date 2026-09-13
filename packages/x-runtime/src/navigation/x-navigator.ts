import { HumanBrowser } from "@ai-os/browser-runtime";

export class XNavigator {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async home(): Promise<void> {
    await this.human.goto("https://x.com/home");
  }

  async explore(): Promise<void> {
    await this.human.goto("https://x.com/explore");
  }

  async notifications(): Promise<void> {
    await this.human.goto("https://x.com/notifications");
  }

  async messages(): Promise<void> {
    await this.human.goto("https://x.com/messages");
  }

  async bookmarks(): Promise<void> {
    await this.human.goto("https://x.com/i/bookmarks");
  }

  async communities(): Promise<void> {
    await this.human.goto("https://x.com/i/communities");
  }

  async profile(username?: string): Promise<void> {

    if (!username) {
      await this.human.goto("https://x.com");
      return;
    }

    await this.human.goto(`https://x.com/${username}`);

  }

  async search(query: string): Promise<void> {
    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}`
    );
  }

}
