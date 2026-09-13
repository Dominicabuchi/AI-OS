import {
  BrowserContext,
  Page
} from "playwright";

export class TabManager {

  constructor(
    private readonly context: BrowserContext
  ) {}

  getAllTabs(): Page[] {

    return this.context.pages();

  }

  getCurrentTab(): Page {

    const pages = this.context.pages();

    if (pages.length === 0)
      throw new Error("No browser tabs available.");

    return pages[0];

  }

  async getOrCreateTab(): Promise<Page> {

    const pages = this.context.pages();

    if (pages.length > 0)
      return pages[0];

    return this.context.newPage();

  }

  async findTabByUrl(
    url: string
  ): Promise<Page | undefined> {

    for (const page of this.context.pages()) {

      if (
        page.url() === url ||
        page.url().startsWith(url)
      ) {

        await page.bringToFront();

        return page;

      }

    }

    return undefined;

  }

  async findTabByDomain(
    domain: string
  ): Promise<Page |undefined> {

    for (const page of this.context.pages()) {

      try {

        const hostname =
          new URL(page.url()).hostname;

        if (
          hostname === domain ||
          hostname.endsWith("." + domain)
        ) {

          await page.bringToFront();

          return page;

        }

      } catch {}

    }

    return undefined;

  }

  async getOrCreateTabByUrl(
    url: string
  ): Promise<Page> {

    const existing =
      await this.findTabByUrl(url);

    if (existing)
      return existing;

    const page =
      await this.context.newPage();

    await page.goto(
      url,
      { waitUntil: "networkidle" }
    );

    return page;

  }

  async getOrCreateTabByDomain(
    domain: string,
    fallbackUrl: string
  ): Promise<Page> {

    const existing =
      await this.findTabByDomain(domain);

    if (existing)
      return existing;

    const page =
      await this.context.newPage();

    await page.goto(
      fallbackUrl,
      { waitUntil: "networkidle" }
    );

    return page;

  }

}
