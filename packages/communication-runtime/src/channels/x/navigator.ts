import { HumanBrowser } from "@ai-os/browser-runtime";
import { XConfig } from "./config";

export class XNavigator {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async home(): Promise<void> {
    await this.human.goto(
      XConfig.urls.home
    );
  }

  async inbox(): Promise<void> {
    await this.human.goto(
      XConfig.urls.inbox
    );
  }

  async profile(): Promise<void> {
    await this.human.goto(
      XConfig.urls.profile!
    );
  }

  async search(
    query: string
  ): Promise<void> {

    await this.home();

    await this.human.adaptiveType({

      platform: "x",
      page: "home",
      action: "search",
      description: "Search",
      value: query

    });

    await this.human.adaptivePress({

      platform: "x",
      page: "home",
      action: "submit-search",
      description: "Search",

    }, "Enter");

  }

  async openThread(
    id: string
  ): Promise<string> {

    await this.inbox();

    const items =
      await this.human.locator(
        XConfig.selectors.conversationItem!
      );

    await items
      .nth(Number(id))
      .click();

    return (
      await items
        .nth(Number(id))
        .innerText()
    ).trim();

  }

}
