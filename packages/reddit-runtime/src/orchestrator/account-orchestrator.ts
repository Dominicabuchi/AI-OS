import { AccountRegistry } from "./account-registry";
import { AccountPool } from "./account-pool";
import { AccountBootstrapper } from "./account-bootstrapper";
import { AccountHealthMonitor } from "./account-health-monitor";

export class AccountOrchestrator {

  readonly registry =
    new AccountRegistry();

  readonly bootstrapper =
    new AccountBootstrapper();

  readonly pool =
    new AccountPool();

  readonly monitor =
    new AccountHealthMonitor();

  async bootstrap(): Promise<void> {

    await this.bootstrapper.bootstrapAll();

  }

  async start(): Promise<void> {

    console.log("");
    console.log("====================================");
    console.log("Starting Account Pool");
    console.log("====================================");

    await this.pool.start();

    console.log("");
    console.log(
      `Running Accounts: ${this.pool.all().size}`
    );

  }

  async health(): Promise<void> {

    console.log("");
    console.log("====================================");
    console.log("Checking Account Health");
    console.log("====================================");

    await this.monitor.checkAll();

  }

  account(id: string) {

    return this.pool.get(id);

  }

  async stop(): Promise<void> {

    await this.pool.stop();

  }

}
