import fs from "fs";
import path from "path";

import {
  BrowserContext,
  chromium
} from "playwright";

import { HumanBrowser } from "../human";
import { SessionManager } from "../session";
import { TabManager } from "../tab";
import { AccountManager } from "../accounts";

export interface BrowserStartOptions {
  profile?: string;
  headless?: boolean;
}

/**
 * Process-wide browser runtime.
 *
 * AI-OS has one browser runtime per Node process.
 * Individual tools obtain the shared manager through
 * BrowserManager.shared().
 *
 * This prevents multiple tools from attempting to open
 * the same persistent Chromium profile simultaneously.
 */
export class BrowserManager {

  private static sharedInstance?: BrowserManager;

  static shared(): BrowserManager {
    if (!BrowserManager.sharedInstance) {
      BrowserManager.sharedInstance = new BrowserManager();
    }

    return BrowserManager.sharedInstance;
  }

  private context?: BrowserContext;
  private human?: HumanBrowser;
  private sessions?: SessionManager;
  private tabs?: TabManager;

  private readonly accounts = new AccountManager();

  private profile = "default";
  private headless =
    process.env.AI_OS_BROWSER_HEADLESS === "true";

  private readonly executablePath =
    chromium.executablePath();

  private getProfileDirectory(profile: string): string {

    const dir = path.resolve(
      process.env.AI_OS_STATE_DIR ?? ".ai-os",
      "profiles",
      profile
    );

    fs.mkdirSync(dir, {
      recursive: true
    });

    return dir;
  }

  async start(
    options: BrowserStartOptions = {}
  ): Promise<void> {

    if (this.context) {
      return;
    }

    this.profile =
      options.profile ?? this.profile;

    this.headless =
      options.headless ?? this.headless;

    this.context =
      await chromium.launchPersistentContext(
        this.getProfileDirectory(this.profile),
        {
          executablePath: this.executablePath,
          headless: this.headless,

          viewport: {
            width: 1440,
            height: 900
          },

          locale: "en-US",

          timezoneId:
            "America/Toronto",

          colorScheme: "light",

          ignoreHTTPSErrors: true
        }
      );

    this.sessions =
      new SessionManager(this.context);

    this.tabs =
      new TabManager(this.context);

    const page =
      await this.sessions.getOrCreateSession();

    this.human =
      new HumanBrowser(page);
  }

  async useProfile(
    profile: string
  ): Promise<void> {

    let resolvedProfile =
      profile;

    if (
      profile === "linkedin" ||
      profile === "reddit" ||
      profile === "x"
    ) {

      const account =
        this.accounts.get(
          profile
        );

      if (
        account?.profile
      ) {
        resolvedProfile =
          account.profile;
      }

    }

    if (
      this.context &&
      this.profile ===
        resolvedProfile
    ) {
      return;
    }

    await this.close();

    await this.start({
      profile:
        resolvedProfile,
      headless:
        this.headless
    });
  }

  async restart(): Promise<void> {

    const profile =
      this.profile;

    const headless =
      this.headless;

    await this.close();

    await this.start({
      profile,
      headless
    });
  }

  isRunning(): boolean {
    return !!this.context;
  }

  getContext(): BrowserContext {

    if (!this.context) {
      throw new Error(
        "Browser not started."
      );
    }

    return this.context;
  }

  getProfile(): string {
    return this.profile;
  }

  getProfilePath(): string {

    return this.getProfileDirectory(
      this.profile
    );
  }

  getHumanBrowser(): HumanBrowser {

    if (!this.human) {
      throw new Error(
        "Browser not started."
      );
    }

    return this.human;
  }

  getSessionManager(): SessionManager {

    if (!this.sessions) {
      throw new Error(
        "Browser not started."
      );
    }

    return this.sessions;
  }

  getTabManager(): TabManager {

    if (!this.tabs) {
      throw new Error(
        "Browser not started."
      );
    }

    return this.tabs;
  }

  getPage() {
    return this.getHumanBrowser().page;
  }

  async usePlatform(
    platform:
      | "linkedin"
      | "x"
      | "reddit"
  ): Promise<void> {

    const account =
      this.accounts.use(platform);

    await this.useProfile(
      account.profile
    );
  }

  getAccountManager(): AccountManager {
    return this.accounts;
  }

  async close(): Promise<void> {

    await this.context?.close();

    this.context =
      undefined;

    this.human =
      undefined;

    this.sessions =
      undefined;

    this.tabs =
      undefined;
  }
}
