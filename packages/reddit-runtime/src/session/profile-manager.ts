import fs from "fs";
import path from "path";
import { DataRoot } from "../data";

export class ProfileManager {

  private readonly root =
    DataRoot.path("profiles");

  constructor() {
    fs.mkdirSync(
      this.root,
      {
        recursive: true
      }
    );
  }

  path(accountId: string): string {

    const profile =
      path.join(
        this.root,
        accountId
      );

    fs.mkdirSync(
      profile,
      {
        recursive: true
      }
    );

    return profile;

  }

}
