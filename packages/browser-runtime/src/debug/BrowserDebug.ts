import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { BrowserContext, Page } from "playwright";

import { DOMSnapshot } from "../adaptive/DOMSnapshot";

import {
  CaptureResult,
  SelectorInfo,
  SelectorReport,
  SelectorResult
} from "./types";

export class BrowserDebug {

  private readonly snapshot: DOMSnapshot;

  constructor(
    private readonly page: Page,
    private readonly context: BrowserContext
  ) {
    this.snapshot = new DOMSnapshot(page);
  }

  private timestamp(): string {
    return new Date().toISOString().replace(/:/g, "-");
  }

  private async ensureDirectory(name: string): Promise<string> {

    const directory = path.join(
      process.cwd(),
      "debug",
      name,
      this.timestamp()
    );

    await mkdir(directory, { recursive: true });

    return directory;
  }

  private async storage(type: "localStorage" | "sessionStorage") {

    return this.page.evaluate((storageType) => {

      const storage =
        storageType === "localStorage"
          ? window.localStorage
          : window.sessionStorage;

      const result: Record<string, string> = {};

      for (let i = 0; i < storage.length; i++) {

        const key = storage.key(i);

        if (!key) continue;

        result[key] = storage.getItem(key) ?? "";

      }

      return result;

    }, type);

  }

  private async selectorCount(selector: string): Promise<SelectorInfo> {

    return {
      selector,
      count: await this.page.locator(selector).count()
    };

  }

  async selector(selector: string): Promise<SelectorResult> {

    const locator = this.page.locator(selector);

    const count = await locator.count();

    if (count === 0) {
      return {
        exists: false,
        visible: false,
        count: 0
      };
    }

    return {

      exists: true,

      visible: await locator.first().isVisible(),

      count,

      html: await locator.first().evaluate(
        element => element.outerHTML
      )

    };

  }

  async capture(name: string): Promise<CaptureResult> {

    const directory = await this.ensureDirectory(name);

    const files: string[] = [];

    await writeFile(
      path.join(directory, "page.html"),
      await this.page.content()
    );

    files.push("page.html");

    await this.page.screenshot({
      path: path.join(directory, "screenshot.png"),
      fullPage: true
    });

    files.push("screenshot.png");

    await writeFile(
      path.join(directory, "url.txt"),
      this.page.url()
    );

    files.push("url.txt");

    await writeFile(
      path.join(directory, "cookies.json"),
      JSON.stringify(
        await this.context.cookies(),
        null,
        2
      )
    );

    files.push("cookies.json");

    await writeFile(
      path.join(directory, "localStorage.json"),
      JSON.stringify(
        await this.storage("localStorage"),
        null,
        2
      )
    );

    files.push("localStorage.json");

    await writeFile(
      path.join(directory, "sessionStorage.json"),
      JSON.stringify(
        await this.storage("sessionStorage"),
        null,
        2
      )
    );

    files.push("sessionStorage.json");

    const selectors: SelectorReport = {

      buttons: [
        await this.selectorCount("button")
      ],

      inputs: [
        await this.selectorCount("input")
      ],

      links: [
        await this.selectorCount("a")
      ],

      forms: [
        await this.selectorCount("form")
      ],

      tables: [
        await this.selectorCount("table")
      ],

      dialogs: [
        await this.selectorCount("dialog")
      ],

      lists: [
        await this.selectorCount("ul"),
        await this.selectorCount("ol")
      ],

      headings: [
        await this.selectorCount("h1"),
        await this.selectorCount("h2"),
        await this.selectorCount("h3"),
        await this.selectorCount("h4"),
        await this.selectorCount("h5"),
        await this.selectorCount("h6")
      ],

      contenteditable: [
        await this.selectorCount("[contenteditable]")
      ],

      ariaRoles: [
        await this.selectorCount("[role]")
      ]

    };

    await writeFile(
      path.join(directory, "selectors.json"),
      JSON.stringify(selectors, null, 2)
    );


    await writeFile(
      path.join(directory, "dom.json"),
      JSON.stringify(
        await this.snapshot.capture(),
        null,
        2
      )
    );

    files.push("dom.json");


    await writeFile(
      path.join(directory, "metadata.json"),
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          url: this.page.url(),
          title: await this.page.title(),
          userAgent: await this.page.evaluate(
            () => navigator.userAgent
          )
        },
        null,
        2
      )
    );

    files.push("metadata.json");


    await writeFile(
      path.join(directory, "viewport.json"),
      JSON.stringify(
        await this.page.evaluate(() => ({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          screen: {
            width: screen.width,
            height: screen.height
          }
        })),
        null,
        2
      )
    );

    files.push("viewport.json");


    try {

      const accessibility = null;

      await writeFile(
        path.join(directory, "accessibility.json"),
        JSON.stringify(accessibility, null, 2)
      );

      files.push("accessibility.json");

    } catch (error) {

      await writeFile(
        path.join(directory, "accessibility.json"),
        JSON.stringify(
          {
            supported: false,
            error: error instanceof Error ? error.message : String(error)
          },
          null,
          2
        )
      );

      files.push("accessibility.json");

    }

    files.push("selectors.json");

    return {
      directory,
      files
    };

  }

}
