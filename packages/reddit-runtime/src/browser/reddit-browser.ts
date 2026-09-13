import { HumanBrowser } from "@ai-os/browser-runtime";

export class RedditBrowser {

  constructor(
    readonly human: HumanBrowser
  ) {}

  async home(): Promise<void> {
    await this.human.goto(
      "https://www.reddit.com/"
    );
  }

  async subreddit(
    name: string
  ): Promise<void> {

    await this.human.goto(
      `https://www.reddit.com/r/${name}`
    );

  }

  async profile(
    username: string
  ): Promise<void> {

    await this.human.goto(
      `https://www.reddit.com/user/${username}`
    );

  }

  async search(
    query: string
  ): Promise<void> {

    await this.human.goto(
      `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`
    );

  }

}
