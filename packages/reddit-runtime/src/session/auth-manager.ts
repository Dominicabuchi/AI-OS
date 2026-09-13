import { BrowserContext } from "playwright";

import { AuthState } from "./auth-state";
import { SessionManager } from "./session-manager";

export interface LoginCredentials {

  username: string;
  password: string;

}

export class AuthManager {

  readonly session =
    new SessionManager();

  async authenticate(

    context: BrowserContext,

    credentials: LoginCredentials

  ): Promise<AuthState> {

    const initial =
      await this.session.state(context);

    if (
      initial === AuthState.AUTHENTICATED
    ) {
      return initial;
    }

    const page =
      await context.newPage();

    await page.goto(
      "https://www.reddit.com/login/",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000
      }
    );

    await page.fill(
      'input[name="username"]',
      credentials.username
    );

    await page.fill(
      'input[name="password"]',
      credentials.password
    );

    console.log("✅ Credentials entered.");

    await page.getByRole(
      "button",
      {
        name: /log in/i
      }
    ).click();

    console.log("✅ Login submitted.");

    while (true) {

      await page.waitForTimeout(
        2000
      );

      const state =
        await this.session.stateFromPage(
          page
        );

      console.log(
        "Current State:",
        state
      );

      if (
        state === AuthState.AUTHENTICATED
      ) {

        await page.close();

        return state;

      }

      if (
        state === AuthState.HUMAN_VERIFICATION
      ) {

        console.log(
          "Complete Reddit verification in the open browser..."
        );

      }

    }

  }

}
