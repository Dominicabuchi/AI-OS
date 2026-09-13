import { Page, Locator } from "playwright";
import { ClickOptions } from "./types";
import { DEFAULT_HUMAN_CONFIG } from "./config";
import { HumanInteraction } from "./human-interaction";

export class MouseEngine {
  private readonly human: HumanInteraction;

  constructor(private readonly page: Page) {
    this.human =
      new HumanInteraction(page);
  }

  async moveTo(selector: string): Promise<Locator> {
    const locator =
      this.page.locator(selector);

    await this.human.prepare(
      locator
    );

    return locator;
  }

  async click(
    selector: string,
    options: ClickOptions = {}
  ): Promise<void> {
    await this.human.click(
      this.page.locator(selector),
      options
    );
  }

  async doubleClick(selector: string): Promise<void> {
    const locator = await this.moveTo(selector);

    await locator.dblclick({
      timeout: DEFAULT_HUMAN_CONFIG.defaultTimeout
    });
  }

  async rightClick(selector: string): Promise<void> {
    const locator = await this.moveTo(selector);

    await locator.click({
      button: "right",
      timeout: DEFAULT_HUMAN_CONFIG.defaultTimeout
    });
  }

  async hover(selector: string): Promise<void> {
    await this.moveTo(selector);
  }

  async scrollIntoView(
    selector: string
  ): Promise<void> {
    await this.human.scrollIntoView(
      this.page.locator(selector)
    );
  }

  async wheel(
    deltaX: number,
    deltaY: number
  ): Promise<void> {

    if (deltaX !== 0) {
      await this.page.mouse.wheel(
        deltaX,
        0
      );

      await this.human.pause(
        350,
        850
      );
    }

    if (deltaY !== 0) {
      await this.human.scrollPage(
        deltaY
      );
    }
  }

  async drag(
    source: string,
    target: string
  ): Promise<void> {
    const from = await this.moveTo(source);
    const to = await this.moveTo(target);

    await from.dragTo(to);
  }
}
