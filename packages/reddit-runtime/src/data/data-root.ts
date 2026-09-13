import fs from "fs";
import path from "path";

export class DataRoot {

  static readonly root =
    process.env.AI_OS_REDDIT_DATA_DIR ??
    path.resolve(
      __dirname,
      "../../../..",
      "reddit-data"
    );

  static init() {

    const dirs = [
      "",
      "accounts",
      "profiles",
      "cookies",
      "storage",
      "sessions"
    ];

    for (const dir of dirs) {

      fs.mkdirSync(
        path.join(
          this.root,
          dir
        ),
        {
          recursive: true
        }
      );

    }

  }

  static path(
    ...parts: string[]
  ) {

    return path.join(
      this.root,
      ...parts
    );

  }

}

DataRoot.init();
