import { BrowserContext } from "playwright";

import { AuthManager } from "./auth-manager";
import { AuthState } from "./auth-state";
import { CookieManager } from "./cookie-manager";
import { AuthFinalizer } from "./auth-finalizer";
import { CredentialProvider } from "../secrets";
import { DataRoot } from "../data";

export class BootstrapManager {

  readonly auth =
    new AuthManager();

  readonly cookies =
    new CookieManager();

  readonly finalizer =
    new AuthFinalizer();

  readonly credentials =
    new CredentialProvider();

  async bootstrap(
    accountId: string,
    context: BrowserContext
  ): Promise<boolean> {

    console.log("");
    console.log("======================================");
    console.log("Bootstrapping:", accountId);
    console.log("======================================");

    const state =
      await this.auth.authenticate(
        context,
        this.credentials.get(accountId)
      );

    if (
      state !== AuthState.AUTHENTICATED
    ) {

      console.log("");
      console.log("Complete Reddit login if required.");

      while (true) {

        await new Promise(resolve =>
          setTimeout(resolve, 2000)
        );

        const current =
          await this.auth.session.state(
            context
          );

        console.log(
          "Current State:",
          current
        );

        if (
          current === AuthState.AUTHENTICATED
        ) {
          break;
        }

      }

    }

    await this.cookies.save(
      context,
      DataRoot.path(
        `cookies/${accountId}.json`
      )
    );

    await context.storageState({
      path: DataRoot.path(
        `storage/${accountId}.json`
      )
    });

    this.finalizer.finalize(
      accountId
    );

    console.log("");
    console.log("✅ Bootstrap Complete");

    return true;

  }

}
