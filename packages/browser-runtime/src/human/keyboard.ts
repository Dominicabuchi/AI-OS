import { Page } from "playwright";
import { DEFAULT_HUMAN_CONFIG } from "./config";
import { TypeOptions } from "./types";
import { HumanInteraction } from "./human-interaction";

export class KeyboardEngine {
  private readonly human: HumanInteraction;

  constructor(private readonly page: Page) {
    this.human =
      new HumanInteraction(page);
  }

  async type(
    selector: string,
    text: string,
    options: TypeOptions = {}
  ): Promise<void> {
    await this.human.type(
      this.page.locator(selector),
      text,
      options
    );
  }

  async fill(
    selector: string,
    text: string
  ): Promise<void> {
    await this.human.fill(
      this.page.locator(selector),
      text
    );
  }

  async press(
    selector: string,
    key: string
  ): Promise<void> {
    await this.human.press(
      this.page.locator(selector),
      key
    );
  }

  async globalPress(
    key: string
  ): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async shortcut(...keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.page.keyboard.down(key);
    }

    const last = keys[keys.length - 1];

    await this.page.keyboard.press(last);

    for (const key of [...keys].reverse()) {
      await this.page.keyboard.up(key);
    }
  }

  async paste(text: string): Promise<void> {
    await this.page.evaluate(async value => {
      await navigator.clipboard.writeText(value);
    }, text);

    await this.globalPress(
      process.platform === "darwin"
        ? "Meta+V"
        : "Control+V"
    );
  }

  async clear(): Promise<void> {
    if (process.platform === "darwin") {
      await this.globalPress("Meta+A");
    } else {
      await this.globalPress("Control+A");
    }

    await this.globalPress("Backspace");
  }

  private randomDelay(): number {
    const min =
      DEFAULT_HUMAN_CONFIG.typingDelayMin;

    const max =
      DEFAULT_HUMAN_CONFIG.typingDelayMax;

    return (
      Math.floor(Math.random() * (max - min + 1)) +
      min
    );
  }
}
