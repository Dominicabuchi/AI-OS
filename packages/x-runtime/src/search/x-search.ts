import { HumanBrowser } from "@ai-os/browser-runtime";
import { XPost, XProfile, XSearchOptions } from "../types";
import { XClient } from "../client";
import { XTransport } from "../transport/x-transport";

export class XSearch {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async search(query: string): Promise<void> {
    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}`
    );
  }


  async top(query: string): Promise<XPost[]> {

    return await XTransport.execute<XPost[]>(

      async () => {

        const result = await XClient.v2.search(query, {
          max_results: 25,
          expansions: ["author_id"],
          "tweet.fields": ["author_id", "text"],
          "user.fields": ["username", "name"],
        });

        const users = new Map(
          (result.includes?.users ?? []).map(u => [u.id, u])
        );

        return (result.data.data ?? []).map(tweet => ({

          id: tweet.id,

          text: tweet.text,

          author: {
            username: users.get(tweet.author_id ?? "")?.username ?? "",
            displayName: users.get(tweet.author_id ?? "")?.name ?? "",
          },

          media: [],

        }));

      },

      async () => {

        await this.search(query);

        return this.posts();

      }

    );

  }


  async latest(query: string): Promise<XPost[]> {
    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}&f=live`
    );
    return this.posts();
  }

  async people(query: string): Promise<XProfile[]> {

    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}&f=user`
    );

    return await this.human.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="UserCell"]'))
        .map((user:any)=>({

          username:
            user.innerText.split("\n")[1] ?? "",

          displayName:
            user.innerText.split("\n")[0] ?? ""

        }))
    );

  }

  async media(query: string): Promise<XPost[]> {

    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}&f=media`
    );

    return this.posts();

  }

  async verified(query: string): Promise<XProfile[]> {
    return this.people(`${query} filter:verified`);
  }

  async hashtags(tag: string): Promise<XPost[]> {

    if (!tag.startsWith("#"))
      tag = "#" + tag;

    return this.latest(tag);

  }

  async communities(query: string): Promise<void> {

    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}`
    );

  }

  async advanced(options: XSearchOptions): Promise<void> {

    let q = options.query;

    if (options.from)
      q += ` from:${options.from}`;

    if (options.since)
      q += ` since:${options.since}`;

    if (options.until)
      q += ` until:${options.until}`;

    if (options.language)
      q += ` lang:${options.language}`;

    if (options.minLikes)
      q += ` min_faves:${options.minLikes}`;

    if (options.minReplies)
      q += ` min_replies:${options.minReplies}`;

    if (options.minReposts)
      q += ` min_retweets:${options.minReposts}`;

    await this.search(q);

  }

  async posts(): Promise<XPost[]> {

    return await this.human.evaluate(() =>
      Array.from(document.querySelectorAll("article"))
        .map((article:any,index)=>({

          id:
            article.getAttribute("data-testid") ??
            String(index),

          text:
            article.innerText,

          author:{
            username:
              article.querySelector('[dir]')?.textContent ?? ""
          }

        }))
    );

  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
