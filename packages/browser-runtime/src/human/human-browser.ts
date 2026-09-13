import { Page } from "playwright";

import { WaitEngine } from "./wait";
import { RetryEngine } from "./retry";
import { DomEngine } from "./dom";
import { MouseEngine } from "./mouse";
import { KeyboardEngine } from "./keyboard";
import { HumanInteraction } from "./human-interaction";
import { BrowserDebug } from "../debug";
import { AdaptiveEngine } from "../adaptive/AdaptiveEngine";
import { SearchRequest } from "../adaptive/types";

export class HumanBrowser {
  readonly wait: WaitEngine;
  readonly retry: RetryEngine;
  readonly dom: DomEngine;
  readonly mouse: MouseEngine;
  readonly keyboard: KeyboardEngine;
  readonly interaction: HumanInteraction;
  readonly debug: BrowserDebug;
  readonly adaptive: AdaptiveEngine;

  constructor(public readonly page: Page) {
    this.wait = new WaitEngine(page);
    this.retry = new RetryEngine();
    this.dom = new DomEngine(page);
    this.mouse = new MouseEngine(page);
    this.keyboard = new KeyboardEngine(page);
    this.interaction =
      new HumanInteraction(page);

    this.debug = new BrowserDebug(
      page,
      page.context()
    );

    this.adaptive = new AdaptiveEngine(page);
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await this.page.waitForLoadState(
      "domcontentloaded"
    );
  }

  async click(selector: string): Promise<void> {
    await this.retry.execute(() =>
      this.mouse.click(selector)
    );
  }

  async type(
    selector: string,
    value: string
  ): Promise<void> {
    await this.retry.execute(() =>
      this.keyboard.type(selector, value)
    );
  }

  async press(
    selector: string,
    key: string
  ): Promise<void> {
    await this.retry.execute(() =>
      this.keyboard.press(selector, key)
    );
  }

  async text(selector: string): Promise<string> {
    return this.retry.execute(() =>
      this.dom.text(selector)
    );
  }

  async exists(selector: string): Promise<boolean> {
    return this.dom.exists(selector);
  }

  async visible(selector: string): Promise<boolean> {
    return this.dom.visible(selector);
  }

  locator(selector: string) {
    return this.page.locator(selector);
  }

  async count(selector: string): Promise<number> {
    return this.page.locator(selector).count();
  }

  async allText(selector: string): Promise<string[]> {
    const locator = this.page.locator(selector);

    const count = await locator.count();

    const values: string[] = [];

    for (let i = 0; i < count; i++) {
      values.push(await locator.nth(i).innerText());
    }

    return values;
  }

  async fill(
    selector: string,
    value: string
  ): Promise<void> {
    await this.retry.execute(async () => {
      await this.page.locator(selector).fill(value);
    });
  }

  async hover(
    selector: string
  ): Promise<void> {
    await this.retry.execute(async () => {
      await this.page.locator(selector).hover();
    });
  }

  async scroll(
    selector?: string
  ): Promise<void> {
    if (selector) {
      await this.interaction.scrollIntoView(
        this.page.locator(selector)
      );

      return;
    }

    await this.interaction.scrollPage();
  }

  async upload(
    selector: string,
    file: string | string[]
  ): Promise<void> {
    await this.page
      .locator(selector)
      .setInputFiles(file);
  }



  async adaptiveClick(
    request: SearchRequest
  ): Promise<void> {
    await this.retry.execute(() =>
      this.adaptive.click(request)
    );
  }

  async adaptiveType(
    request: SearchRequest
  ): Promise<void> {
    await this.retry.execute(() =>
      this.adaptive.type(request)
    );
  }


  async adaptiveFill(
    request: SearchRequest,
    value: string
  ): Promise<void> {
    await this.retry.execute(() =>
      this.adaptive.fill(
        request,
        value
      )
    );
  }


  async adaptiveHover(
    request: SearchRequest
  ): Promise<void> {
    await this.retry.execute(() =>
      this.adaptive.hover(request)
    );
  }

  async adaptivePress(
    request: SearchRequest,
    key: string
  ): Promise<void> {
    await this.retry.execute(() =>
      this.adaptive.press(request, key)
    );
  }

  async adaptiveText(
    request: SearchRequest
  ): Promise<string> {
    return this.retry.execute(() =>
      this.adaptive.text(request)
    );
  }

  async adaptiveExists(
    request: SearchRequest
  ): Promise<boolean> {
    return this.adaptive.exists(request);
  }

  async adaptiveVisible(
    request: SearchRequest
  ): Promise<boolean> {
    return this.adaptive.visible(request);
  }

  async adaptiveCount(
    request: SearchRequest
  ): Promise<number> {
    return this.adaptive.count(request);
  }

  async adaptiveAllText(
    request: SearchRequest
  ): Promise<string[]> {
    return this.adaptive.allText(request);
  }

  async adaptiveScroll(
    request: SearchRequest
  ): Promise<void> {
    await this.adaptive.scroll(request);
  }

  async adaptiveUpload(
    request: SearchRequest,
    file: string
  ): Promise<void> {
    await this.adaptive.upload(
      request,
      file
    );
  }

  async adaptiveWait(
    request: SearchRequest
  ): Promise<void> {
    await this.adaptive.wait(request);
  }

  async verifyStateChanged(
    before: string,
    timeout = 2500
  ): Promise<boolean> {
    return this.interaction.verifyChanged(
      before,
      timeout
    );
  }

  async waitForSelector(
    selector: string
  ): Promise<void> {
    await this.page.waitForSelector(selector);
  }

  async waitForURL(
    url: string | RegExp
  ): Promise<void> {
    await this.page.waitForURL(url);
  }

  async evaluate<T>(
    fn: () => T | Promise<T>
  ): Promise<T> {
    return this.page.evaluate(fn);
  }
}
