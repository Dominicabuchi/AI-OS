import { HumanBrowser } from "@ai-os/browser-runtime";
import { XClient } from "../client";
import { XTransport } from "../transport/x-transport";

export interface XProfile {
  username: string;
  displayName?: string;
}

export interface XProfilePost {
  id: string;
  text: string;
  timestamp?: string;
  replies?: number;
  reposts?: number;
  likes?: number;
  views?: number;
}

export class XProfiles {

  private cursor = 0;
  private currentUsername?: string;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(username: string): Promise<void> {
    this.currentUsername = username;
    await this.human.goto(`https://x.com/${username}`);
  }

  async me(): Promise<void> {
    this.currentUsername = undefined;
    await this.human.goto("https://x.com/home");
  }

  async current(): Promise<XProfile | null> {
    return await this.get();
  }


  async get(): Promise<XProfile | null> {

    if (!this.currentUsername) {

      return await this.human.evaluate(() => {

        const displayName =
          document.querySelector('[data-testid="UserName"]')?.textContent ?? "";

        const username =
          window.location.pathname.replace("/", "");

        return {
          username,
          displayName
        };

      });

    }

    return await XTransport.execute<XProfile | null>(

      async () => {

        const result = await XClient.v2.userByUsername(
          this.currentUsername!,
          {
            "user.fields": ["username", "name"]
          }
        );

        return {
          username: result.data.username,
          displayName: result.data.name
        };

      },

      async () => {

        return await this.human.evaluate(() => {

          const displayName =
            document.querySelector('[data-testid="UserName"]')?.textContent ?? "";

          const username =
            window.location.pathname.replace("/", "");

          return {
            username,
            displayName
          };

        });

      }

    );

  }



  async follow(): Promise<void> {

    if (!this.currentUsername)
      throw new Error("No profile opened.");

    await XTransport.execute(

      () => XClient.v2.follow(
        process.env.X_USER_ID!,
        this.currentUsername!
      ),

      async () => {

        await this.human.adaptiveClick({
          platform:"x",
          page:"profile",
          action:"follow",
          description:"Follow user"
        });

        return {} as any;

      }

    );

  }



  async unfollow(): Promise<void> {

    if (!this.currentUsername)
      throw new Error("No profile opened.");

    await XTransport.execute(

      () => XClient.v2.unfollow(
        process.env.X_USER_ID!,
        this.currentUsername!
      ),

      async () => {

        await this.human.adaptiveClick({
          platform:"x",
          page:"profile",
          action:"unfollow",
          description:"Unfollow user"
        });

        return {} as any;

      }

    );

  }


  async message(): Promise<void> {

    await this.human.adaptiveClick({
      platform:"x",
      page:"profile",
      action:"message",
      description:"Open direct message"
    });

  }


  async posts(): Promise<XProfilePost[]> {

    if (!this.currentUsername)
      throw new Error("No profile opened.");

    return await XTransport.execute<XProfilePost[]>(

      async () => {

        const user = await XClient.v2.userByUsername(
          this.currentUsername!
        );

        const timeline = await XClient.v2.userTimeline(
          user.data.id,
          {
            max_results: 25,
            "tweet.fields": ["created_at","public_metrics"]
          }
        );

        return (timeline.data.data ?? []).map(tweet => ({

          id: tweet.id,

          text: tweet.text,

          timestamp: tweet.created_at,

          replies: tweet.public_metrics?.reply_count,

          reposts: tweet.public_metrics?.retweet_count,

          likes: tweet.public_metrics?.like_count,

          views: tweet.public_metrics?.impression_count

        }));

      },

      async () => {

        return await this.human.evaluate(() =>
          Array.from(document.querySelectorAll("article")).map((article:any,index)=>({

            id:
              article.getAttribute("data-testid") ??
              String(index),

            text:
              article.innerText,

            timestamp:
              article.querySelector("time")?.getAttribute("datetime")

          }))
        );

      }

    );

  }


  async followers(): Promise<void> {

    if (!this.currentUsername)
      throw new Error("No profile opened.");

    await this.human.goto(
      `https://x.com/${this.currentUsername}/followers`
    );

  }

  async following(): Promise<void> {

    if (!this.currentUsername)
      throw new Error("No profile opened.");

    await this.human.goto(
      `https://x.com/${this.currentUsername}/following`
    );

  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
