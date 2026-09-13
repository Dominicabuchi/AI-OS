import { AccountRegistry } from "./account-registry";
import { AccountManager } from "../accounts";
import { BootstrapManager } from "../session";

export class AccountBootstrapper {

  readonly registry =
    new AccountRegistry();

  readonly manager =
    new AccountManager();

  readonly bootstrap =
    new BootstrapManager();

  async bootstrapAll(): Promise<void> {

    for (
      const account of this.registry.all()
    ) {

      if (
        account.initialized
      ) {

        console.log(
          "Skipping:",
          account.id
        );

        continue;

      }

      console.log("");
      console.log("================================");
      console.log("Bootstrapping:", account.id);
      console.log("================================");
      console.log("");

      const context =
        await this.manager.launch(
          account.id
        );

      await this.bootstrap.bootstrap(
        account.id,
        context
      );

      await context.close();

      console.log(
        "Finished:",
        account.id
      );

    }

  }

}
