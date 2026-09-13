import crypto from "crypto";

export class PKCE {

  static verifier(): string {

    return crypto
      .randomBytes(64)
      .toString("base64url");

  }

  static challenge(
    verifier: string
  ): string {

    return crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

  }

}
