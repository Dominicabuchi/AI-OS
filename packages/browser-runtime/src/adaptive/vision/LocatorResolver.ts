import {
  Locator,
  Page
} from "playwright";

import {
  ElementNode
} from "../types";

export class LocatorResolver {

  constructor(
    private readonly page: Page
  ) {}

  resolve(
    element: ElementNode
  ): Locator {

    const selectors: string[] = [];

    if (element.dataTestId) {
      selectors.push(
        `[data-testid="${element.dataTestId}"]`
      );
    }

    if (element.elementId) {
      selectors.push(
        `#${element.elementId}`
      );
    }

    if (element.name) {
      selectors.push(
        `[name="${element.name}"]`
      );
    }

    if (element.ariaLabel) {
      selectors.push(
        `[aria-label="${element.ariaLabel}"]`
      );
    }

    if (element.placeholder) {
      selectors.push(
        `[placeholder="${element.placeholder}"]`
      );
    }

    if (element.role) {
      selectors.push(
        `[role="${element.role}"]`
      );
    }

    if (element.tag) {
      selectors.push(
        element.tag
      );
    }

    return this.page
      .locator(
        [...new Set(selectors)].join(", ")
      )
      .first();

  }

}
