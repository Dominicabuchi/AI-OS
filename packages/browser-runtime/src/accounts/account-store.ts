import * as fs from "fs";
import * as path from "path";

import {
  Account,
  AccountsConfig,
  Platform
} from "./types";

export class AccountStore {

  private readonly file = path.resolve(
    ".ai-os",
    "accounts.json"
  );

  constructor() {

    fs.mkdirSync(
      path.dirname(this.file),
      {
        recursive: true
      }
    );

    if (!fs.existsSync(this.file)) {

      fs.writeFileSync(
        this.file,
        JSON.stringify({}, null, 2)
      );

    }

  }

  load(): AccountsConfig {

    return JSON.parse(
      fs.readFileSync(
        this.file,
        "utf8"
      )
    );

  }

  save(
    accounts: AccountsConfig
  ): void {

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        accounts,
        null,
        2
      )
    );

  }

  get(
    platform: Platform
  ): Account | undefined {

    return this.load()[platform];

  }

  set(
    account: Account
  ): void {

    const accounts =
      this.load();

    accounts[
      account.platform
    ] = account;

    this.save(accounts);

  }

  remove(
    platform: Platform
  ): void {

    const accounts =
      this.load();

    delete accounts[platform];

    this.save(accounts);

  }

}
