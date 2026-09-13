import { TwitterApi } from "twitter-api-v2";

import {
  TokenStore,
  OAuthTokens
} from "./token-store";

export class TokenRefresh {

  private refreshing = false;

  private current?: Promise<OAuthTokens>;

  constructor(
    private readonly store =
      new TokenStore()
  ) {}

  get active(): boolean {
    return this.refreshing;
  }

  async run(): Promise<OAuthTokens> {

    if (this.current) {
      return this.current;
    }

    this.refreshing = true;

    this.current = (async () => {

      const tokens =
        this.store.load();

      if (!tokens.refreshToken) {
        throw new Error(
          "X OAuth2 refresh token is missing."
        );
      }

      const clientId =
        process.env.X_CLIENT_ID;

      if (!clientId) {
        throw new Error(
          "X_CLIENT_ID is missing."
        );
      }

      const clientSecret =
        process.env.X_CLIENT_SECRET;

      const requestClient =
        new TwitterApi({
          clientId,
          ...(clientSecret
            ? { clientSecret }
            : {})
        });

      const result =
        await requestClient
          .refreshOAuth2Token(
            tokens.refreshToken
          );

      if (!result.accessToken) {
        throw new Error(
          "X OAuth2 refresh returned no access token."
        );
      }

      const refreshed: OAuthTokens = {
        accessToken:
          result.accessToken,

        refreshToken:
          result.refreshToken ||
          tokens.refreshToken
      };

      this.store.save(
        refreshed
      );

      return refreshed;
    })();

    try {
      return await this.current;
    } finally {
      this.refreshing = false;
      this.current = undefined;
    }
  }
}
