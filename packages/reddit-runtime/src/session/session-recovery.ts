import { BrowserContext } from "playwright";

import {
  ChallengeDetector,
  ChallengeState
} from "./challenge-detector";

import {
  CookieManager
} from "./cookie-manager";

export class SessionRecovery {

  readonly cookies =
    new CookieManager();

  readonly detector =
    new ChallengeDetector();

  async recover(

    context: BrowserContext,

    cookieFile: string

  ): Promise<boolean> {

    await this.cookies.load(
      context,
      cookieFile
    );

    const state =
      await this.detector.detect(
        context
      );

    if (
      state === ChallengeState.NONE
    ) {
      return true;
    }

    if (
      state === ChallengeState.LOGIN
    ) {
      console.log(
        "Login required."
      );

      return false;
    }

    if (
      state === ChallengeState.HUMAN
    ) {
      console.log(
        "Human verification required."
      );

      return false;
    }

    return false;

  }

}
