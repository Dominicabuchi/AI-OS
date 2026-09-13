import {
  Locator
} from "playwright";

import {
  SearchRequest
} from "../types";

import {
  Resolver
} from "./Resolver";

export class OCRResolver
  implements Resolver {

  readonly name =
    "OCRResolver";

  async resolve(
    _request: SearchRequest
  ): Promise<Locator | null> {

    // Phase 1.
    // Next step will move the existing
    // OCR logic from AdaptiveEngine
    // into this resolver.

    return null;

  }

}
