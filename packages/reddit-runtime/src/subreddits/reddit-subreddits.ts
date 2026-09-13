import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditMCP } from "../mcp";
import { SubredditService as MCPSubredditService } from "../mcp/services/SubredditService";

export class RedditSubreddits {

  private readonly mcp =
    new RedditMCP();

  private readonly mcpSubreddits =
    new MCPSubredditService(
      this.mcp
    );

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(
    name: string
  ) {

    try {

      return await this.mcpSubreddits.browse(
        name
      );

    } catch {

      await this.human.goto(
        `https://www.reddit.com/r/${name}`
      );

      return {
        success: true,
        backend: "browser",
        subreddit: name
      };

    }

  }

  async info(
    name: string
  ) {

    try {

      return await this.mcpSubreddits.getInfo(
        name
      );

    } catch {

      throw new Error(
        "Browser subreddit info fallback not implemented yet."
      );

    }

  }

  async rules(
    name: string
  ) {

    try {

      return await this.mcpSubreddits.getRules(
        name
      );

    } catch {

      throw new Error(
        "Browser subreddit rules fallback not implemented yet."
      );

    }

  }

  async flairs(
    name: string
  ) {

    try {

      return await this.mcpSubreddits.getFlairs(
        name
      );

    } catch {

      throw new Error(
        "Browser subreddit flairs fallback not implemented yet."
      );

    }

  }

  async top(
    name: string,
    limit = 25
  ) {

    try {

      return await this.mcpSubreddits.getTop(
        name,
        limit
      );

    } catch {

      await this.human.goto(
        `https://www.reddit.com/r/${name}/top/`
      );

      return {
        success: true,
        backend: "browser",
        subreddit: name
      };

    }

  }

  async trending() {

    return this.mcpSubreddits.trending();

  }

  async join(): Promise<void> {

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "subreddit",
      action: "join",
      description: "Join button"
    });

  }

  async leave(): Promise<void> {

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "subreddit",
      action: "leave",
      description: "Joined button"
    });

  }

}
