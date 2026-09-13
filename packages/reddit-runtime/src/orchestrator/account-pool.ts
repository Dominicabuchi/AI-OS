import { BrowserContext } from "playwright";

import { AccountManager } from "../accounts";
import { AccountRegistry } from "./account-registry";

export class AccountPool {

  readonly registry =
    new AccountRegistry();

  readonly manager =
    new AccountManager();

  readonly contexts =
    new Map<
      string,
      BrowserContext
    >();

  async start(): Promise<void> {

    for (
      const account of this.registry.all()
    ) {

      console.log(
        "Launching:",
        account.id
      );

      const context =
        await this.manager.launch(
          account.id
        );

      this.contexts.set(
        account.id,
        context
      );

      console.log(
        "Ready:",
        account.id
      );

    }

  }

  get(
    accountId: string
  ): BrowserContext {

    const context =
      this.contexts.get(
        accountId
      );

    if (!context) {
      throw new Error(
        `Account not running: ${accountId}`
      );
    }

    return context;

  }

  all(): Map<
    string,
    BrowserContext
  > {

    return this.contexts;

  }

  async stop(): Promise<void> {

    for (
      const context of
      this.contexts.values()
    ) {

      await context.close();

    }

    this.contexts.clear();

  }

}
