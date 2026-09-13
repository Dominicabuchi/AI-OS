import fs from "fs";
import path from "path";

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class TokenStore {

  private readonly envPath =
    path.resolve(
      process.cwd(),
      "/Users/joseph/AI-OS/.env"
    );

  load(): OAuthTokens {

    const text =
      fs.readFileSync(
        this.envPath,
        "utf8"
      );

    const values: Record<string,string> = {};

    for (const line of text.split("\n")) {

      const index = line.indexOf("=");

      if (index === -1) {
        continue;
      }

      const key =
        line.slice(0, index);

      const value =
        line.slice(index + 1);

      values[key] = value;

    }

    return {

      accessToken:
        values.X_OAUTH2_ACCESS_TOKEN,

      refreshToken:
        values.X_OAUTH2_REFRESH_TOKEN,

    };

  }

  save(tokens: OAuthTokens): void {

    let text =
      fs.readFileSync(
        this.envPath,
        "utf8"
      );

    text =
      text.replace(
        /^X_OAUTH2_ACCESS_TOKEN=.*$/m,
        `X_OAUTH2_ACCESS_TOKEN=${tokens.accessToken}`
      );

    text =
      text.replace(
        /^X_OAUTH2_REFRESH_TOKEN=.*$/m,
        `X_OAUTH2_REFRESH_TOKEN=${tokens.refreshToken}`
      );

    fs.writeFileSync(
      this.envPath,
      text
    );

  }

}
