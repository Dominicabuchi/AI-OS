import { PKCE } from "./pkce";

export class OAuthLogin {

  create() {

    const verifier =
      PKCE.verifier();

    const challenge =
      PKCE.challenge(verifier);

    const params =
      new URLSearchParams({

        response_type: "code",

        client_id:
          process.env.X_CLIENT_ID!,

        redirect_uri:
          "http://localhost:3000/api/auth/x/callback",

        scope: [
          "tweet.read",
          "tweet.write",
          "users.read",
          "follows.read",
          "follows.write",
          "like.read",
          "like.write",
          "offline.access"
        ].join(" "),

        state:
          crypto.randomUUID(),

        code_challenge:
          challenge,

        code_challenge_method:
          "S256",

      });

    return {

      verifier,

      url:
        "https://x.com/i/oauth2/authorize?" +
        params.toString(),

    };

  }

}
