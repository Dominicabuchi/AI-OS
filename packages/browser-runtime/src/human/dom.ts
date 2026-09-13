import { Locator, Page } from "playwright";
import { DEFAULT_HUMAN_CONFIG } from "./config";

export class DomEngine {
  constructor(private readonly page: Page) {}

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async wait(selector: string): Promise<Locator> {
    const locator = this.locator(selector);

    await locator.waitFor({
      state: "visible",
      timeout: DEFAULT_HUMAN_CONFIG.defaultTimeout
    });

    return locator;
  }

  async exists(selector: string): Promise<boolean> {
    return (await this.locator(selector).count()) > 0;
  }

  async visible(selector: string): Promise<boolean> {
    if (!(await this.exists(selector))) {
      return false;
    }

    return this.locator(selector).isVisible();
  }

  async enabled(selector: string): Promise<boolean> {
    if (!(await this.exists(selector))) {
      return false;
    }

    return this.locator(selector).isEnabled();
  }

  async editable(selector: string): Promise<boolean> {
    if (!(await this.exists(selector))) {
      return false;
    }

    return this.locator(selector).isEditable();
  }

  async text(selector: string): Promise<string> {
    const locator = await this.wait(selector);

    return (await locator.innerText()).trim();
  }

  async html(selector: string): Promise<string> {
    const locator = await this.wait(selector);

    return await locator.innerHTML();
  }

  async attribute(
    selector: string,
    name: string
  ): Promise<string | null> {
    const locator = await this.wait(selector);

    return locator.getAttribute(name);
  }

  async count(selector: string): Promise<number> {
    return this.locator(selector).count();
  }

  async first(selector: string): Promise<Locator> {
    return (await this.wait(selector)).first();
  }

  async last(selector: string): Promise<Locator> {
    return (await this.wait(selector)).last();
  }
}
