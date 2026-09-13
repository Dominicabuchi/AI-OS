import { Locator } from "playwright";

import {
  SearchRequest
} from "../types";

import {
  Resolver
} from "./Resolver";

export class SnapshotResolver
  implements Resolver {

  readonly name =
    "SnapshotResolver";

  async resolve(
    _request: SearchRequest
  ): Promise<Locator | null> {

    return null;

  }

}
