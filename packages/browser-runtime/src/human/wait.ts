import { Locator, Page } from "playwright";
import { WaitOptions } from "./types";
import { DEFAULT_HUMAN_CONFIG } from "./config";

export class WaitEngine {
  constructor(private readonly page: Page) {}

  async timeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async load(
    state: "load" | "domcontentloaded" | "networkidle" = "networkidle"
  ): Promise<void> {
    await this.page.waitForLoadState(state, {
      timeout: DEFAULT_HUMAN_CONFIG.defaultTimeout,
    });
  }

  async selector(
    selector: string,
    options: WaitOptions = {}
  ): Promise<Locator> {
    const locator = this.page.locator(selector);

    await locator.waitFor({
      state: options.state ?? "visible",
      timeout:
        options.timeout ??
        DEFAULT_HUMAN_CONFIG.defaultTimeout,
    });

    return locator;
  }

  async hidden(
    selector: string,
    timeout = DEFAULT_HUMAN_CONFIG.defaultTimeout
  ): Promise<void> {
    await this.page.locator(selector).waitFor({
      state: "hidden",
      timeout,
    });
  }

  async attached(
    selector: string,
    timeout = DEFAULT_HUMAN_CONFIG.defaultTimeout
  ): Promise<Locator> {
    const locator = this.page.locator(selector);

    await locator.waitFor({
      state: "attached",
      timeout,
    });

    return locator;
  }

  async detached(
    selector: string,
    timeout = DEFAULT_HUMAN_CONFIG.defaultTimeout
  ): Promise<void> {
    await this.page.locator(selector).waitFor({
      state: "detached",
      timeout,
    });
  }

  async until(
    predicate: () => Promise<boolean>,
    timeout = DEFAULT_HUMAN_CONFIG.defaultTimeout,
    interval = 200
  ): Promise<void> {
    const end = Date.now() + timeout;

    while (Date.now() < end) {
      if (await predicate()) {
        return;
      }

      await this.page.waitForTimeout(interval);
    }

    throw new Error("Wait condition timed out.");
  }
}
