import fs from "fs";
import { RedditAccount } from "./account-types";
import { DataRoot } from "../data";

export class AccountStore {

  private readonly root =
    DataRoot.root;

  private readonly file =
    DataRoot.path(
      "accounts.json"
    );

  constructor() {

    fs.mkdirSync(this.root, {
      recursive: true
    });

    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(
        this.file,
        "[]"
      );
    }

  }

  all(): RedditAccount[] {

    return JSON.parse(
      fs.readFileSync(
        this.file,
        "utf8"
      )
    );

  }

  save(
    accounts: RedditAccount[]
  ) {

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        accounts,
        null,
        2
      )
    );

  }

  add(
    account: RedditAccount
  ) {

    const accounts =
      this.all();

    accounts.push(account);

    this.save(accounts);

  }

  get(
    id: string
  ): RedditAccount | undefined {

    return this
      .all()
      .find(a => a.id === id);

  }


  update(
    id: string,
    partial: Partial<RedditAccount>
  ) {

    const accounts =
      this.all();

    const index =
      accounts.findIndex(
        a => a.id === id
      );

    if (index === -1) {
      throw new Error(
        `Unknown account: ${id}`
      );
    }

    accounts[index] = {
      ...accounts[index],
      ...partial
    };

    this.save(accounts);

  }

}
