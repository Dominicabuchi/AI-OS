import fs from "fs";
import path from "path";

export interface OAuthTokens {

  accessToken: string;

  refreshToken: string;

}

interface StoredOAuthTokens {

  accessToken?: string;

  refreshToken?: string;

}

export class TokenStore {

  private readonly file =
    process.env.AI_OS_X_TOKEN_STORE ??
    path.join(
      path.resolve(
        process.env.AI_OS_STATE_DIR ?? ".ai-os"
      ),
      "x-oauth.json"
    );

  load(): OAuthTokens {

    let stored: StoredOAuthTokens = {};

    if (fs.existsSync(this.file)) {

      try {

        stored =
          JSON.parse(
            fs.readFileSync(
              this.file,
              "utf8"
            )
          );

      } catch {

        stored = {};

      }

    }

    return {

      accessToken:
        stored.accessToken ??
        process.env.X_OAUTH2_ACCESS_TOKEN ??
        "",

      refreshToken:
        stored.refreshToken ??
        process.env.X_OAUTH2_REFRESH_TOKEN ??
        "",

    };

  }

  save(tokens: OAuthTokens): void {

    fs.mkdirSync(
      path.dirname(this.file),
      {
        recursive: true
      }
    );

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        },
        null,
        2
      ),
      {
        encoding: "utf8",
        mode: 0o600
      }
    );

    try {

      fs.chmodSync(
        this.file,
        0o600
      );

    } catch {

      // Best effort on platforms without chmod support.

    }

  }

}
