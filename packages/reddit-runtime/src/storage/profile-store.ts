import fs from "fs";

export class ProfileStore {

  ensure(path: string) {

    fs.mkdirSync(path, {
      recursive: true
    });

  }

}
