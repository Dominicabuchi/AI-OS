import {
  Locator,
  Page
} from "playwright";

import {
  DOMSnapshot
} from "../DOMSnapshot";

import {
  Strategy
} from "../Strategy";

import {
  SearchRequest
} from "../types";

import {
  Resolver
} from "./Resolver";

export class LiveDOMResolver
  implements Resolver {

  readonly name =
    "LiveDOMResolver";

  constructor(

    private readonly page: Page,

    private readonly snapshot: DOMSnapshot,

    private readonly strategy: Strategy

  ) {}

  async resolve(
    request: SearchRequest
  ): Promise<Locator | null> {

    const snap =
      await this.snapshot.capture();

    const ranked =
      this.strategy.rank(
        snap.elements,
        request
      );

    for (const candidate of ranked) {

      try {

        const locator =
          this.page
            .locator(
              candidate.element.selector
            )
            .first();

        if (
          await locator.count() === 0
        ) {
          continue;
        }

        if (
          !(await locator.isVisible())
        ) {
          continue;
        }

        if (
          !(await locator.isEnabled())
        ) {
          continue;
        }

        if (
          request.value !== undefined
        ) {

          const editable =
            await locator.evaluate(el => {

              const tag =
                el.tagName.toLowerCase();

              return (

                tag === "input" ||

                tag === "textarea" ||

                el.hasAttribute(
                  "contenteditable"
                )

              );

            });

          if (!editable) {
            continue;
          }

        }

        console.log(
          "[Resolver] LiveDOM matched:",
          candidate.element.selector
        );

        console.log("");
        console.log("========== LIVE DOM ==========");
        console.log(
          "Selector:",
          candidate.element.selector
        );

        console.log(
          await locator.evaluate(el => ({
            tag: el.tagName,
            text: el.textContent,
            aria: el.getAttribute("aria-label"),
            name: el.getAttribute("name"),
            placeholder: el.getAttribute("placeholder"),
            role: el.getAttribute("role"),
            aiosId: el.getAttribute("data-aios-id")
          }))
        );

        return locator;

      } catch {}

    }

    return null;

  }

}
