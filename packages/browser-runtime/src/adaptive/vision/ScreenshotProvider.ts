import { Page } from "playwright";

export class ScreenshotProvider {

  constructor(
    private readonly page: Page
  ) {}

  async capture(): Promise<string> {

    const path =
      `.adaptive-vision/${Date.now()}.png`;

    await this.page.screenshot({

      path,

      fullPage: true

    });

    return path;

  }

}
