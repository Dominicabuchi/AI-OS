import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path:
    process.env.AI_OS_ENV_FILE ??
    path.resolve(
      process.cwd(),
      ".env"
    ),
});

import { OAuthManager } from "../auth";

const manager =
  new OAuthManager();

void manager.initialize();

export class XClient {

  static get api() {

    return manager.api();

  }

  static get v2() {

    return manager.api().v2;

  }

  static get auth() {

    return manager;

  }

}
