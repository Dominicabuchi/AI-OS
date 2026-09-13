import { HumanBrowser } from "@ai-os/browser-runtime";
import { XPost } from "../types";

export class XBookmarks {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(): Promise<void> {
    await this.human.goto("https://x.com/i/bookmarks");
  }

  async list(): Promise<XPost[]> {

    await this.open();

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

  async remove(): Promise<void> {

    await this.human.adaptiveClick({
      platform:"x",
      page:"bookmarks",
      action:"remove-bookmark",
      description:"Remove bookmark"
    });

  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
