import { RedditBrowser } from "../browser";

export class RedditNavigation {

  constructor(
    private readonly browser: RedditBrowser
  ) {}

  async home(): Promise<void> {
    await this.browser.home();
  }

  async subreddit(name: string): Promise<void> {
    await this.browser.subreddit(name);
  }

  async profile(username: string): Promise<void> {
    await this.browser.profile(username);
  }

  async inbox(): Promise<void> {
    await this.browser.human.goto(
      "https://www.reddit.com/message/inbox/"
    );
  }

  async notifications(): Promise<void> {
    await this.browser.human.goto(
      "https://www.reddit.com/notifications/"
    );
  }

  async submit(subreddit: string): Promise<void> {
    await this.browser.human.goto(
      `https://www.reddit.com/r/${subreddit}/submit`
    );
  }

}
