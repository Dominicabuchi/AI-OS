import { XClient } from "../client";

export class VerifySession {

  async verify(): Promise<boolean> {

    try {

      await XClient.v2.me();

      return true;

    } catch {

      return false;

    }

  }

}
