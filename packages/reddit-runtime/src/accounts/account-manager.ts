import { BrowserContext } from "playwright";

import { AccountStore } from "./account-store";
import { ProfileManager } from "../session";
import { BrowserSession } from "../session";

export class AccountManager {

  readonly store =
    new AccountStore();

  readonly profiles =
    new ProfileManager();

  readonly browser =
    new BrowserSession();

  async launch(
    accountId: string
  ): Promise<BrowserContext> {

    const account =
      this.store.get(accountId);

    if (!account) {
      throw new Error(
        `Unknown account: ${accountId}`
      );
    }

    return this.browser.launch(
      this.profiles.path(
        account.id
      )
    );

  }

}
