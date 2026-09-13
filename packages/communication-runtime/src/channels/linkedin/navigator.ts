import { HumanBrowser } from "@ai-os/browser-runtime";
import { LinkedInConfig } from "./config";

export class LinkedInNavigator {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async home(): Promise<void> {
    await this.human.goto(
      LinkedInConfig.urls.home
    );
  }

  async inbox(): Promise<void> {
    await this.human.goto(
      LinkedInConfig.urls.inbox
    );
  }

  async profile(): Promise<void> {
    await this.human.goto(
      LinkedInConfig.urls.profile!
    );
  }

  async search(
    query: string
  ): Promise<void> {

    await this.home();

    await this.human.adaptiveType({

      platform: "linkedin",
      page: "home",
      action: "search",
      description: "Search",
      value: query

    });

    await this.human.adaptivePress({

      platform: "linkedin",
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
        LinkedInConfig.selectors.conversationItem!
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
