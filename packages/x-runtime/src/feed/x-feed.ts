import { HumanBrowser } from "@ai-os/browser-runtime";
import { TwitterApi } from "twitter-api-v2";

import { XClient } from "../client";
import { XPostOptions } from "../types";
import { XTransport } from "../transport/x-transport";
import { XBrowserActions } from "./browser-actions";

export interface XAuthor {
  username: string;
  displayName?: string;
}

export interface XMedia {
  type?: string;
  url?: string;
}

export interface XPost {
  id: string;
  text: string;
  author: XAuthor;
  media: XMedia[];
}

export class XFeed {

  private readonly api: TwitterApi;
  private cursor = 0;
  private currentPosts: XPost[] = [];

  private readonly browser?: XBrowserActions;

  constructor(
    private readonly human?: HumanBrowser
  ) {
    this.api = XClient.api;

    if (human) {
      this.browser = new XBrowserActions(human);
    }

  }

  async home(): Promise<void> {
    if (this.human) {
      await this.human.goto("https://x.com/home");
    }
  }

  async refresh(): Promise<void> {
    await this.home();
  }

  async getPosts(): Promise<XPost[]> {

    const timeline = await this.api.v2.homeTimeline({
      max_results: 20,
      expansions: ["author_id"],
      "tweet.fields": ["created_at"],
      "user.fields": ["username", "name"]
    });

    const users = new Map(
      (timeline.includes?.users ?? []).map(u => [u.id, u])
    );

    this.currentPosts = timeline.data.data.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      author: {
        username: users.get(tweet.author_id ?? "")?.username ?? "",
        displayName: users.get(tweet.author_id ?? "")?.name
      },
      media: []
    }));

    return this.currentPosts;
  }

  async createPost(options: XPostOptions): Promise<void> {

    await this.api.v2.tweet({
      text: options.text ?? ""
    });

  }

  async getPost(): Promise<XPost | null> {
    const posts = await this.getPosts();

    return posts.length
      ? posts[this.cursor]
      : null;
  }

  async next(): Promise<void> {
    this.cursor++;
  }


  async like(): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.like(process.env.X_USER_ID!, post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human.adaptiveClick({
          platform: "x",
          page: "feed",
          action: "like",
          description: "Like current post",
        });

        return { data: { liked: true } } as any;
      },
    );
  }

  async unlike(): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.unlike(process.env.X_USER_ID!, post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human.adaptiveClick({
          platform: "x",
          page: "feed",
          action: "unlike",
          description: "Unlike current post",
        });

        return { data: { liked: false } } as any;
      },
    );
  }

  async reply(text: string): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.reply(text, post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human!.adaptiveFill(
          {
            platform: "x",
            page: "reply",
            action: "editor",
            description: "Reply editor"
          },
          text
        );

        await this.human!.adaptiveClick({
          platform: "x",
          page: "reply",
          action: "send",
          description: "Send reply"
        });

        return {} as any;
      },
    );
  }

  async repost(): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.retweet(process.env.X_USER_ID!, post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human!.adaptiveClick({
          platform: "x",
          page: "feed",
          action: "repost",
          description: "Repost current post"
        });

        return {} as any;
      },
    );
  }

  async quote(text: string): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.quote(text, post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human!.adaptiveClick({
          platform: "x",
          page: "feed",
          action: "quote",
          description: "Quote current post"
        });

        await this.human!.adaptiveFill(
          {
            platform: "x",
            page: "quote",
            action: "editor",
            description: "Quote editor"
          },
          text
        );

        await this.human!.adaptiveClick({
          platform: "x",
          page: "quote",
          action: "post",
          description: "Post quote"
        });

        return {} as any;
      },
    );
  }

  async bookmark(): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.bookmark(post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human!.adaptiveClick({
          platform: "x",
          page: "feed",
          action: "bookmark",
          description: "Bookmark post"
        });

        return {} as any;
      },
    );
  }

  async unbookmark(): Promise<void> {
    const post = await this.getPost();

    if (!post) {
      throw new Error("No current post.");
    }

    await XTransport.execute(
      () => XClient.v2.deleteBookmark(post.id),
      async () => {
        if (!this.human) {
          throw new Error("Browser runtime unavailable.");
        }

        await this.human!.adaptiveClick({
          platform: "x",
          page: "feed",
          action: "remove-bookmark",
          description: "Remove bookmark"
        });

        return {} as any;
      },
    );
  }


  async openAuthor(): Promise<void> {
    if (!this.human) {
      throw new Error("Browser runtime unavailable.");
    }

    await this.human.adaptiveClick({
      platform: "x",
      page: "feed",
      action: "author",
      description: "Open author"
    });
  }

  async scroll(): Promise<void> {
    if (this.human) {
      await this.human.scroll();
    }
  }

  async loadMore(): Promise<void> {
    await this.scroll();
  }

}
