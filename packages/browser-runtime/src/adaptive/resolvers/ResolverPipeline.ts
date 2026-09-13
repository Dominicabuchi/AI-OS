import { Locator } from "playwright";

import {
  SearchRequest
} from "../types";

import {
  Resolver
} from "./Resolver";

export class ResolverPipeline {

  constructor(

    private readonly resolvers: Resolver[]

  ) {}

  async resolve(

    request: SearchRequest

  ): Promise<Locator | null> {

    for (const resolver of this.resolvers) {

      try {

        const locator =
          await resolver.resolve(
            request
          );

        if (locator) {

          console.log(
            "[Resolver]",
            resolver.name,
            "resolved",
            request.action
          );

          return locator;

        }

      } catch (error) {

        console.warn(

          "[Resolver]",

          resolver.name,

          "failed:",

          error instanceof Error
            ? error.message
            : error

        );

      }

    }

    return null;

  }

}
