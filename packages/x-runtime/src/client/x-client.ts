import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "/Users/joseph/AI-OS/.env"
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
