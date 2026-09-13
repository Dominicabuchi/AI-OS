import {
  Locator,
  Page
} from "playwright";

import {
  SearchRequest
} from "../types";

import {
  DOMSnapshot
} from "../DOMSnapshot";

import {
  Strategy
} from "../Strategy";

import {
  Resolver
} from "./Resolver";

import {
  ScreenshotProvider,
  VisionAnalyzer,
  CandidateMatcher,
  LocatorResolver
} from "../vision";

export class VisionResolver
  implements Resolver {

  readonly name =
    "VisionResolver";

  private readonly screenshots: ScreenshotProvider;

  private readonly analyzer: VisionAnalyzer;

  private readonly matcher: CandidateMatcher;

  private readonly locatorResolver: LocatorResolver;

  constructor(
    private readonly page: Page,
    private readonly snapshot: DOMSnapshot,
    private readonly strategy: Strategy
  ) {

    this.screenshots =
      new ScreenshotProvider(page);

    this.analyzer =
      new VisionAnalyzer();

    this.matcher =
      new CandidateMatcher();

    this.locatorResolver =
      new LocatorResolver(page);

  }

  async resolve(
    request: SearchRequest
  ): Promise<Locator | null> {

    const image =
      await this.screenshots.capture();

    const vision =
      await this.analyzer.analyze(
        image,
        request
      );

    const snapshot =
      await this.snapshot.capture();

    let match =
      this.matcher.match(
        vision,
        snapshot.elements
      );

    if (!match) {

      const ranked =
        this.strategy.rank(
          snapshot.elements,
          request
        );

      if (ranked.length === 0) {
        return null;
      }

      match =
        ranked[0].element;

    }

    return this.locatorResolver.resolve(
      match
    );

  }

}
