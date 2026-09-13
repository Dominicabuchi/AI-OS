import { BrowserContext, Page } from "playwright";
import { AuthState } from "./auth-state";

export class SessionManager {

  async state(
    context: BrowserContext
  ): Promise<AuthState> {

    const page = await context.newPage();

    try {
      await page.goto(
        "https://www.reddit.com/",
        {
          waitUntil: "domcontentloaded",
          timeout: 60000
        }
      );

      return await this.stateFromPage(page);

    } finally {
      await page.close();
    }

  }

  async stateFromPage(
    page: Page
  ): Promise<AuthState> {

    await page.waitForTimeout(1500);

    const url = page.url();
    const title = await page.title();
    const body = await page.locator("body").innerText();

    if (
      title.includes("Prove your humanity") ||
      body.includes("Complete the challenge below")
    ) {
      return AuthState.HUMAN_VERIFICATION;
    }

    if (
      url.includes("/login") ||
      (body.includes("Log In") && body.includes("Sign Up"))
    ) {
      return AuthState.LOGIN_REQUIRED;
    }

    const avatar =
      await page.locator(
        '[id*="user"], button[aria-label*="User"], button[aria-label*="Profile"]'
      ).count();

    if (avatar > 0) {
      return AuthState.AUTHENTICATED;
    }

    return AuthState.UNKNOWN;
  }

}
