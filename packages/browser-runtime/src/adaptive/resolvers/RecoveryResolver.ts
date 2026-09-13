import {
  Locator,
  Page
} from "playwright";

import {
  SearchRequest
} from "../types";

import {
  Resolver
} from "./Resolver";

export class RecoveryResolver
  implements Resolver {

  readonly name =
    "RecoveryResolver";

  constructor(
    private readonly page: Page
  ) {}

  async resolve(
    request: SearchRequest
  ): Promise<Locator | null> {

    const candidates = [

      () => this.page.getByRole("button",{name:request.description,exact:false}).first(),
      () => this.page.getByRole("link",{name:request.description,exact:false}).first(),
      () => this.page.getByRole("textbox",{name:request.description,exact:false}).first(),
      () => this.page.getByRole("combobox",{name:request.description,exact:false}).first(),
      () => this.page.getByRole("searchbox",{name:request.description,exact:false}).first(),
      () => this.page.getByRole("checkbox",{name:request.description,exact:false}).first(),
      () => this.page.getByRole("radio",{name:request.description,exact:false}).first(),

      () => this.page.getByLabel(request.description,{exact:false}).first(),
      () => this.page.getByPlaceholder(request.description,{exact:false}).first(),
      () => this.page.getByTitle(request.description,{exact:false}).first(),
      () => this.page.getByAltText(request.description,{exact:false}).first(),

      () => this.page.getByText(request.description,{exact:false}).first(),

      () => this.page.getByTestId(request.description).first(),

      () => this.page.locator(`[aria-label*="${request.description}"]`).first(),
      () => this.page.locator(`[placeholder*="${request.description}"]`).first(),
      () => this.page.locator(`[title*="${request.description}"]`).first(),
      () => this.page.locator(`[name*="${request.description}"]`).first(),
      () => this.page.locator(`[id*="${request.description}"]`).first(),
      () => this.page.locator(`[data-testid*="${request.description}"]`).first(),

      () => this.page.locator("input").first(),
      () => this.page.locator("textarea").first(),
      () => this.page.locator("[contenteditable='true']").first(),

      () => this.page.locator(
        `xpath=//*[contains(normalize-space(.),"${request.description}")]`
      ).first()

    ];

    const recovered: Array<{
      locator: Locator;
      score: number;
    }> = [];

    for (const create of candidates) {

      try {

        const locator = create();

        if (await locator.count() === 0)
          continue;

        if (!(await locator.isVisible()))
          continue;

        if (!(await locator.isEnabled()))
          continue;

        const meta =
          await locator.evaluate(el => ({

            tag:
              el.tagName.toLowerCase(),

            role:
              el.getAttribute("role"),

            aria:
              el.getAttribute("aria-label"),

            placeholder:
              el.getAttribute("placeholder"),

            text:
              el.textContent ?? "",

            href:
              el.getAttribute("href")

          }));

        let score = 100;

        if (
          request.value !== undefined &&
          (
            meta.tag === "input" ||
            meta.tag === "textarea"
          )
        ) {
          score += 500;
        }

        if (
          meta.aria?.toLowerCase().includes(
            request.description.toLowerCase()
          )
        ) {
          score += 150;
        }

        if (
          meta.placeholder?.toLowerCase().includes(
            request.description.toLowerCase()
          )
        ) {
          score += 150;
        }

        if (
          meta.text?.toLowerCase().includes(
            request.description.toLowerCase()
          )
        ) {
          score += 100;
        }

        if (
          meta.href?.startsWith("#")
        ) {
          score -= 500;
        }

        recovered.push({
          locator,
          score
        });

      } catch {}

    }

    recovered.sort(
      (a,b)=>b.score-a.score
    );

    if (
      recovered.length === 0
    ) {
      return null;
    }

    return recovered[0].locator;

  }

}
