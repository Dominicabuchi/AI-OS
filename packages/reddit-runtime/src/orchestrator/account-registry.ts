import { AccountStore } from "../accounts";
import { RedditAccount } from "../accounts";

export class AccountRegistry {

  readonly store =
    new AccountStore();

  all(): RedditAccount[] {

    return this.store
      .all()
      .filter(
        account => account.enabled
      );

  }

  get(
    id: string
  ): RedditAccount {

    const account =
      this.store.get(id);

    if (!account) {
      throw new Error(
        `Unknown account: ${id}`
      );
    }

    return account;

  }

}
