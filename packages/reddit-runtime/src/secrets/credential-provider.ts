import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path:
    process.env.AI_OS_ENV_FILE ??
    path.resolve(
      process.cwd(),
      ".env"
    )
});

export interface AccountCredentials {

  username: string;

  password: string;

}

export class CredentialProvider {

  get(
    accountId: string
  ): AccountCredentials {

    const prefix =
      accountId
        .replace(/-/g, "_")
        .toUpperCase();

    const username =
      process.env[
        `REDDIT_${prefix}_EMAIL`
      ];

    const password =
      process.env[
        `REDDIT_${prefix}_PASSWORD`
      ];

    if (
      !username ||
      !password
    ) {

      throw new Error(
        `No credentials configured for ${accountId}`
      );

    }

    return {

      username,

      password

    };

  }

}
