import { HumanBrowser } from "@ai-os/browser-runtime";

export class RedditActions {

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async click(
    page: string,
    action: string,
    description: string
  ) {

    await this.human.adaptiveClick({
      platform: "reddit",
      page,
      action,
      description
    });

  }

  async type(
    page: string,
    action: string,
    text: string,
    description: string
  ) {

    await this.human.adaptiveType({
      platform: "reddit",
      page,
      action,
      description,
      text
    });

  }

  async fill(
    page: string,
    action: string,
    value: string,
    description: string
  ) {

    await this.human.adaptiveFill(
      {
        platform: "reddit",
        page,
        action,
        description
      },
      value
    );

  }

  async scroll(
    page: string,
    description = "Scroll"
  ) {

    await this.human.adaptiveScroll({
      platform: "reddit",
      page,
      action: "scroll",
      description
    });

  }

}
