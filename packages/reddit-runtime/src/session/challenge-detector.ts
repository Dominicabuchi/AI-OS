import { BrowserContext } from "playwright";

export enum ChallengeState {

  NONE="none",

  HUMAN="human",

  LOGIN="login",

  UNKNOWN="unknown"

}

export class ChallengeDetector {

  async detect(
    context: BrowserContext
  ): Promise<ChallengeState> {

    const page =
      await context.newPage();

    await page.goto(
      "https://www.reddit.com/",
      {
        waitUntil:"domcontentloaded",
        timeout:60000
      }
    );

    await page.waitForTimeout(1500);

    const title =
      await page.title();

    const body =
      await page.locator("body").innerText();

    const url =
      page.url();

    await page.close();

    if (
      title.includes("Prove your humanity")
    ) {
      return ChallengeState.HUMAN;
    }

    if (
      url.includes("/login")
    ) {
      return ChallengeState.LOGIN;
    }

    if (
      body.includes("Complete the challenge below")
    ) {
      return ChallengeState.HUMAN;
    }

    if (
      url.startsWith("https://www.reddit.com/")
    ) {
      return ChallengeState.NONE;
    }

    return ChallengeState.UNKNOWN;

  }

}
