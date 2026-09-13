import { Locator, Page } from "playwright";

import { Memory } from "../Memory";
import { SearchRequest } from "../types";
import { LocatorValidator } from "../locator";
import { Resolver } from "./Resolver";

export class MemoryResolver implements Resolver {

  readonly name = "MemoryResolver";

  constructor(
    private readonly page: Page,
    private readonly memory: Memory,
    private readonly validator: LocatorValidator
  ) {}

  async resolve(
    request: SearchRequest
  ): Promise<Locator | null> {

    const learned =
      this.memory.best(
        request.platform,
        request.page,
        request.action
      );

    if (!learned) {
      return null;
    }

    const locator =
      this.page
        .locator(
          learned.selector
        )
        .first();

    const valid =
      await this.validator.validate(
        locator,
        request
      );

    this.memory.update(
      request.platform,
      request.page,
      request.action,
      learned.selector,
      valid
    );

    return valid
      ? locator
      : null;

  }

}
