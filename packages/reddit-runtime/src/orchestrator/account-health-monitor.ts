import { AccountPool } from "./account-pool";
import { AccountStore } from "../accounts";
import { SessionManager } from "../session";

export class AccountHealthMonitor {

  readonly pool =
    new AccountPool();

  readonly store =
    new AccountStore();

  readonly session =
    new SessionManager();

  async checkAll(): Promise<void> {

    for (
      const [id, context] of
      this.pool.all()
    ) {

      const state =
        await this.session.state(
          context
        );

      this.store.update(
        id,
        {
          authenticated:
            state === "authenticated",

          lastSessionCheck:
            Date.now()
        }
      );

      console.log(
        `${id}: ${state}`
      );

    }

  }

}
