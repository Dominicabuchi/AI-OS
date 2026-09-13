import {
  BrowserContext,
  Page
} from "playwright";

export class SessionManager {

  private readonly sessions =
    new Map<string, Page>();

  private activeAccount = "default";

  constructor(
    private readonly context: BrowserContext
  ) {}

  getPages(): Page[] {
    return this.context.pages();
  }

  getCurrentPage(): Page | undefined {
    return this.sessions.get(this.activeAccount)
      ?? this.context.pages()[0];
  }

  hasSession(): boolean {
    return this.context.pages().length > 0;
  }

  async createPage(): Promise<Page> {

    const page =
      await this.context.newPage();

    this.sessions.set(
      this.activeAccount,
      page
    );

    return page;

  }

  async getOrCreateSession(): Promise<Page> {

    const existing =
      this.sessions.get(
        this.activeAccount
      );

    if (
      existing &&
      !existing.isClosed()
    ) {
      return existing;
    }

    const pages =
      this.context.pages();

    if (pages.length > 0) {

      this.sessions.set(
        this.activeAccount,
        pages[0]
      );

      return pages[0];

    }

    return this.createPage();

  }

  async reuseSession(): Promise<Page> {
    return this.getOrCreateSession();
  }

  async restoreSession(): Promise<Page> {
    return this.getOrCreateSession();
  }

  async recoverSession(): Promise<Page> {
    return this.getOrCreateSession();
  }

  setActiveAccount(
    account: string
  ) {

    this.activeAccount = account;

  }

  getActiveAccount(): string {

    return this.activeAccount;

  }

  async switchAccount(
    account: string
  ): Promise<Page> {

    this.activeAccount = account;

    return this.getOrCreateSession();

  }

  async hasAuthenticatedSession(
    page: Page,
    verification: {
      url?: string;
      selector?: string;
    }
  ): Promise<boolean> {

    try {

      if (
        verification.url &&
        !page.url().startsWith(
          verification.url
        )
      ) {

        await page.goto(
          verification.url,
          {
            waitUntil:
              "networkidle"
          }
        );

      }

      if (!verification.selector)
        return true;

      return (
        await page.$(
          verification.selector
        )
      ) !== null;

    } catch {

      return false;

    }

  }

  async verifyLogin(
    page: Page,
    verification: {
      url?: string;
      selector?: string;
    }
  ): Promise<boolean> {

    if (
      await this.hasAuthenticatedSession(
        page,
        verification
      )
    ) {
      return true;
    }

    if (
      verification.url?.startsWith(
        "https://x.com"
      )
    ) {

      console.log(
        "X login required. Please sign in..."
      );

      await page.goto(
        "https://x.com/login",
        {
          waitUntil: "domcontentloaded"
        }
      );

      try {

        await page.waitForURL(
          url =>
            url.href.startsWith(
              "https://x.com/home"
            ),
          {
            timeout:
              10 * 60 * 1000
          }
        );

      } catch {

        return false;

      }

      return this.hasAuthenticatedSession(
        page,
        verification
      );

    }

    return false;

  }

  async isSessionExpired(
    page: Page,
    verification: {
      url?: string;
      selector?: string;
    }
  ): Promise<boolean> {

    return !(
      await this.verifyLogin(
        page,
        verification
      )
    );

  }

}
