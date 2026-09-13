import {
  BrowserContext
} from "playwright";

import path from "path";

import {
  BrowserManager
} from "@ai-os/browser-runtime";

export class BrowserSession {

  private readonly browser =
    BrowserManager.shared();

  async launch(
    profilePath: string
  ): Promise<BrowserContext> {

    const accountId =
      path.basename(profilePath);

    if (!accountId) {
      throw new Error(
        "Reddit account profile id is required."
      );
    }

    const canonicalProfile =
      `reddit/${accountId}`;

    await this.browser.useProfile(
      canonicalProfile
    );

    console.log(
      `[BrowserSession] Canonical Chromium profile: ${canonicalProfile}`
    );

    return this.browser.getContext();
  }
}
