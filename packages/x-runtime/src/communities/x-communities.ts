import { HumanBrowser } from "@ai-os/browser-runtime";
import { XPost } from "../types";

export interface XCommunity {
  id: string;
  name: string;
  description?: string;
  members?: number;
}

export class XCommunities {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(): Promise<void> {
    await this.human.goto("https://x.com/i/communities");
  }

  async search(query: string): Promise<XCommunity[]> {

    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(query)}`
    );

    return await this.human.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="cellInnerDiv"]'))
        .map((item:any,index)=>({
          id: String(index),
          name: item.innerText.split("\n")[0] ?? "",
          description: item.innerText
        }))
    );

  }

  async join(): Promise<void> {

    await this.human.adaptiveClick({
      platform:"x",
      page:"communities",
      action:"join",
      description:"Join community"
    });

  }

  async leave(): Promise<void> {

    await this.human.adaptiveClick({
      platform:"x",
      page:"communities",
      action:"leave",
      description:"Leave community"
    });

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
              article.querySelector("[dir]")?.textContent ?? ""
          }

        }))
    );

  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
