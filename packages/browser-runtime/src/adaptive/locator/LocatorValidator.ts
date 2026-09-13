import { Locator } from "playwright";

import {
  SearchRequest
} from "../types";

export class LocatorValidator {

  async validate(
    locator: Locator,
    request: SearchRequest
  ): Promise<boolean> {

    if (await locator.count() === 0) {
      return false;
    }

    if (!(await locator.isVisible())) {
      return false;
    }

    if (!(await locator.isEnabled())) {
      return false;
    }

    const meta = await locator.evaluate(el => ({

      tag:
        el.tagName.toLowerCase(),

      text:
        (el.textContent ?? "").toLowerCase(),

      aria:
        (el.getAttribute("aria-label") ?? "").toLowerCase(),

      placeholder:
        (el.getAttribute("placeholder") ?? "").toLowerCase(),

      title:
        (el.getAttribute("title") ?? "").toLowerCase(),

      role:
        (el.getAttribute("role") ?? "").toLowerCase(),

      type:
        (el.getAttribute("type") ?? "").toLowerCase()

    }));

    const desc =
      request.description.toLowerCase();

    //
    // LINK TAB
    //

    if (request.action === "link-tab") {

      return (

        meta.text.includes("link") ||

        meta.aria.includes("link") ||

        meta.title.includes("link")

      );

    }

    //
    // EXTERNAL URL
    //

    if (request.action === "link") {

      return (

        meta.placeholder.includes("url") ||

        meta.placeholder.includes("link") ||

        meta.aria.includes("url") ||

        meta.aria.includes("external") ||

        meta.type === "url"

      );

    }

    //
    // Fill actions
    //

    if (request.value !== undefined) {

      return (

        meta.tag === "input" ||

        meta.tag === "textarea"

      );

    }

    //
    // Generic semantic validation
    //

    return (

      meta.text.includes(desc) ||

      meta.aria.includes(desc) ||

      meta.placeholder.includes(desc) ||

      meta.title.includes(desc)

    );

  }

}
