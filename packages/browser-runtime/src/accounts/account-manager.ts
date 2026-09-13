import { AccountStore } from "./account-store";

import {
  Account,
  Platform
} from "./types";

export class AccountManager {

  private readonly store =
    new AccountStore();

  get(
    platform: Platform
  ): Account | undefined {

    return this.store.get(platform);

  }

  create(
    platform: Platform
  ): Account {

    const existing =
      this.store.get(platform);

    if (existing)
      return existing;

    const now =
      new Date().toISOString();

    const account: Account = {

      platform,

      profile: platform,

      createdAt: now,

      lastUsed: now

    };

    this.store.set(account);

    return account;

  }

  use(
    platform: Platform
  ): Account {

    const account =
      this.create(platform);

    account.lastUsed =
      new Date().toISOString();

    this.store.set(account);

    return account;

  }

  remove(
    platform: Platform
  ): void {

    this.store.remove(platform);

  }

  list(): Account[] {

    return [

      "linkedin",

      "x",

      "reddit"

    ]
      .map(
        platform =>
          this.store.get(
            platform as Platform
          )
      )
      .filter(
        Boolean
      ) as Account[];

  }

}
