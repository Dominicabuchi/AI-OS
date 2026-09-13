import { BrowserContext, Page } from "playwright";

export class BrowserState {

  constructor(
    private readonly context: BrowserContext,
    private readonly page: Page
  ) {}

  async url(): Promise<string> {
    return this.page.url();
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async cookies() {
    return this.context.cookies();
  }

  async screenshot(path: string) {
    await this.page.screenshot({
      path,
      fullPage: true
    });
  }

  async html(): Promise<string> {
    return this.page.content();
  }

}
