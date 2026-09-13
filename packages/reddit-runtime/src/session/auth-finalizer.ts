import { AccountStore } from "../accounts";

export class AuthFinalizer {

  readonly store =
    new AccountStore();

  finalize(
    accountId: string
  ): void {

    this.store.update(
      accountId,
      {
        initialized: true,
        authenticated: true,
        lastAuthenticated: Date.now(),
        lastCookieSave: Date.now(),
        lastStorageSave: Date.now(),
        lastSessionCheck: Date.now()
      }
    );

    console.log(
      "✅ Account metadata updated."
    );

  }

}
