import { HumanBrowser } from "@ai-os/browser-runtime";

export interface XTrend {
  name: string;
  posts?: string;
  category?: string;
}

export class XTrends {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(): Promise<void> {
    await this.human.goto("https://x.com/explore/tabs/trending");
  }

  async list(): Promise<XTrend[]> {

    await this.open();

    return await this.human.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="trend"]'))
        .map((trend:any)=>({

          name:
            trend.innerText.split("\n")[0] ?? "",

          posts:
            trend.innerText.split("\n")[1] ?? "",

          category:
            trend.innerText.split("\n")[2] ?? ""

        }))
    );

  }

  async openTrend(name:string): Promise<void> {
    await this.human.goto(
      `https://x.com/search?q=${encodeURIComponent(name)}`
    );
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
