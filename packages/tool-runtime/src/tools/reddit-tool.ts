import { Tool } from "../types/tool";
import { BrowserManager } from "@ai-os/browser-runtime";
import { RedditRuntime } from "@ai-os/reddit-runtime";

export class RedditTool implements Tool {

  readonly id = "reddit";

  readonly name = "Reddit";

  readonly description =
    "Reddit posting, comments, search, communities, users, messages and notifications.";

  private browser = BrowserManager.shared();
  private runtime?: RedditRuntime;

  canExecute(action: string): boolean {
    return action.startsWith("reddit.");
  }

  private async getRuntime(): Promise<RedditRuntime> {
    await this.browser.usePlatform(
      "reddit"
    );

    this.runtime =
      new RedditRuntime(
        this.browser.getHumanBrowser()
      );

    return this.runtime;
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const runtime = await this.getRuntime();

    switch (action) {

      case "reddit.post":
      case "reddit.create_post":
      case "reddit.submit":
        return runtime.createPost({
          subreddit: String(payload.subreddit ?? ""),
          title: String(payload.title ?? ""),
          body: String(payload.body ?? payload.text ?? "")
        });

      case "reddit.search":
        return runtime.search.search(
          String(payload.query ?? "")
        );

      case "reddit.messages":
        return runtime.messages;

      case "reddit.notifications":
        return runtime.notifications;

      case "reddit.feed":
        return runtime.feed;

      case "reddit.subreddits":
        return runtime.subreddits;

      case "reddit.posts":
        return runtime.posts;

      case "reddit.comments":
        return runtime.comments;

      case "reddit.users":
        return runtime.users;

      default:
        throw new Error(
          `Unsupported Reddit action: ${action}`
        );
    }
  }
}
