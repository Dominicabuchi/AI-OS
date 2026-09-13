import { Locator } from "playwright";

import {
  SearchRequest
} from "../types";

export interface Resolver {

  readonly name: string;

  resolve(
    request: SearchRequest
  ): Promise<Locator | null>;

}
