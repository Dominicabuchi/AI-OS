import { BrowserContext } from "playwright";

import { CookieManager } from "./cookie-manager";
import { ChallengeDetector, ChallengeState } from "./challenge-detector";

export class SessionMonitor {

  readonly cookies =
    new CookieManager();

  readonly detector =
    new ChallengeDetector();

  async check(
    context: BrowserContext,
    cookieFile: string
  ): Promise<ChallengeState> {

    const state =
      await this.detector.detect(context);

    if (state === ChallengeState.NONE) {
      await this.cookies.save(
        context,
        cookieFile
      );
    }

    return state;

  }

}
