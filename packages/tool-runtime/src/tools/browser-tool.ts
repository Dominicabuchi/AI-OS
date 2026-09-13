import { Tool } from "../types/tool";
import {
  BrowserManager,
  goto,
  click,
  type,
  extract
} from "@ai-os/browser-runtime";

export class BrowserTool implements Tool {

  readonly id = "browser";

  readonly name = "Browser";

  readonly description = "Browser automation";

  private readonly browser =
    BrowserManager.shared();

  canExecute(
    action: string
  ): boolean {

    return action.startsWith("browser.");

  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const profile =
      (payload.profile as string) ?? "default";

    if (!this.browser.isRunning()) {

      await this.browser.start({
        profile
      });

    } else if (
      this.browser.getProfile() !== profile
    ) {

      await this.browser.useProfile(profile);

    }

    let page = this.browser.getPage();

    if (page.isClosed()) {

      await this.browser.restart();

      page = this.browser.getPage();

    }

    switch (action) {

      case "browser.goto":

        return goto(
          page,
          payload.url as string
        );

      case "browser.click":

        return click(
          page,
          payload.selector as string
        );

      case "browser.type":

        return type(
          page,
          payload.selector as string,
          payload.text as string
        );

      case "browser.extract":

        return extract(
          page,
          payload.selector as string
        );

      default:

        throw new Error(
          `Unsupported browser action: ${action}`
        );

    }

  }

}
