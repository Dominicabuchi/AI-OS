import { Locator, Page } from "playwright";
import { DEFAULT_HUMAN_CONFIG } from "./config";
import { ClickOptions, TypeOptions } from "./types";

export class HumanInteraction {

  constructor(
    private readonly page: Page
  ) {}

  private random(
    min: number,
    max: number
  ): number {
    return Math.floor(
      Math.random() * (max - min + 1)
    ) + min;
  }

  async pause(
    min = DEFAULT_HUMAN_CONFIG.actionPauseMin,
    max = DEFAULT_HUMAN_CONFIG.actionPauseMax
  ): Promise<void> {
    await this.page.waitForTimeout(
      this.random(min, max)
    );
  }

  async usable(
    locator: Locator,
    editable = false
  ): Promise<boolean> {

    if (
      await locator.count().catch(
        () => 0
      ) === 0
    ) {
      return false;
    }

    if (
      !(await locator.isVisible().catch(
        () => false
      ))
    ) {
      return false;
    }

    if (
      !(await locator.isEnabled().catch(
        () => false
      ))
    ) {
      return false;
    }

    if (
      editable &&
      !(await locator.isEditable().catch(
        () => false
      ))
    ) {
      return false;
    }

    const box =
      await locator.boundingBox().catch(
        () => null
      );

    return !!(
      box &&
      box.width > 4 &&
      box.height > 4
    );
  }

  async prepare(
    locator: Locator,
    editable = false
  ): Promise<Locator> {

    await locator.waitFor({
      state: "visible",
      timeout:
        DEFAULT_HUMAN_CONFIG.defaultTimeout
    });

    if (
      !(await this.usable(
        locator,
        editable
      ))
    ) {
      throw new Error(
        "HumanInteraction: target is not usable."
      );
    }

    await locator.scrollIntoViewIfNeeded();

    await this.pause();

    const box =
      await locator.boundingBox();

    if (
      !box ||
      box.width <= 4 ||
      box.height <= 4
    ) {
      throw new Error(
        "HumanInteraction: target has no usable bounding box."
      );
    }

    await this.page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
      {
        steps:
          DEFAULT_HUMAN_CONFIG.mouseMoveSteps
      }
    );

    await this.pause(
      250,
      650
    );

    return locator;
  }

  async click(
    locator: Locator,
    options: ClickOptions = {}
  ): Promise<void> {

    await this.prepare(locator);

    await locator.click({
      timeout:
        options.timeout ??
        DEFAULT_HUMAN_CONFIG.defaultTimeout,
      button:
        options.button ?? "left",
      clickCount:
        options.clickCount ?? 1,
      delay:
        this.random(
          DEFAULT_HUMAN_CONFIG.clickDelayMin,
          DEFAULT_HUMAN_CONFIG.clickDelayMax
        )
    });

    await this.pause(
      550,
      1250
    );
  }

  async type(
    locator: Locator,
    text: string,
    options: TypeOptions = {}
  ): Promise<void> {

    await this.prepare(
      locator,
      true
    );

    if (options.clear) {
      await locator.clear();

      await this.pause(
        250,
        500
      );
    }

    await locator.pressSequentially(
      text,
      {
        delay:
          options.delay ??
          this.random(
            DEFAULT_HUMAN_CONFIG.typingDelayMin,
            DEFAULT_HUMAN_CONFIG.typingDelayMax
          )
      }
    );

    await this.pause(
      650,
      1300
    );
  }

  async fill(
    locator: Locator,
    text: string
  ): Promise<void> {

    await this.prepare(
      locator,
      true
    );

    await locator.fill(text);

    await this.pause(
      500,
      1000
    );
  }

  async press(
    locator: Locator,
    key: string
  ): Promise<void> {

    await this.prepare(
      locator,
      true
    );

    await locator.press(
      key,
      {
        delay:
          this.random(
            80,
            180
          )
      }
    );

    await this.pause(
      500,
      1000
    );
  }

  async hover(
    locator: Locator
  ): Promise<void> {

    await this.prepare(locator);

    await this.pause(
      700,
      1400
    );
  }

  async scrollIntoView(
    locator: Locator
  ): Promise<void> {

    await locator.waitFor({
      state: "attached",
      timeout:
        DEFAULT_HUMAN_CONFIG.defaultTimeout
    });

    await locator.scrollIntoViewIfNeeded();

    await this.pause(
      DEFAULT_HUMAN_CONFIG.scrollPauseMin,
      DEFAULT_HUMAN_CONFIG.scrollPauseMax
    );
  }

  async scrollPage(
    deltaY = 0
  ): Promise<void> {

    const distance =
      deltaY ||
      this.random(
        500,
        900
      );

    const direction =
      distance < 0
        ? -1
        : 1;

    let remaining =
      Math.abs(distance);

    while (remaining > 0) {

      const step =
        Math.min(
          remaining,
          this.random(
            DEFAULT_HUMAN_CONFIG.scrollStepMin,
            DEFAULT_HUMAN_CONFIG.scrollStepMax
          )
        );

      await this.page.mouse.wheel(
        0,
        step * direction
      );

      remaining -= step;

      await this.pause(
        DEFAULT_HUMAN_CONFIG.scrollPauseMin,
        DEFAULT_HUMAN_CONFIG.scrollPauseMax
      );
    }
  }

  async fingerprint(): Promise<string> {

    return this.page.evaluate(() => {

      const body =
        document.body;

      return (
        `${location.href}|` +
        `${document.title}|` +
        `${body?.innerText?.slice(0, 12000) ?? ""}|` +
        `${document.querySelectorAll("*").length}`
      );
    });
  }

  async verifyChanged(
    before: string,
    timeout = 2500
  ): Promise<boolean> {

    const deadline =
      Date.now() + timeout;

    while (
      Date.now() < deadline
    ) {

      const after =
        await this.fingerprint();

      if (
        after !== before
      ) {
        return true;
      }

      await this.page.waitForTimeout(
        250
      );
    }

    return false;
  }
}
