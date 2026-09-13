import { TwitterApi } from "twitter-api-v2";

import { TokenStore } from "./token-store";
import { VerifySession } from "./verify-session";
import { TokenRefresh } from "./token-refresh";
import { SessionManager } from "./session-manager";
import { RefreshScheduler } from "./refresh-scheduler";

export class OAuthManager {

  readonly store =
    new TokenStore();

  readonly verifier =
    new VerifySession();

  readonly refresh =
    new TokenRefresh(
      this.store
    );

  readonly session =
    new SessionManager();

  readonly scheduler =
    new RefreshScheduler();

  private client?: TwitterApi;

  private initialization?:
    Promise<boolean>;

  initialize(): Promise<boolean> {

    if (this.initialization) {
      return this.initialization;
    }

    this.initialization =
      this.initializeInternal();

    return this.initialization;
  }

  private async initializeInternal():
    Promise<boolean> {

    this.session.initialize();

    try {
      await this.ensureAuthenticated();

      this.scheduler.start(
        55 * 60 * 1000,
        async () => {

          if (this.refresh.active) {
            return;
          }

          this.session.refreshing(true);

          try {
            await this.refresh.run();

            this.rebuild();

            await this.client!.v2.me();

            this.session.authenticated();

          } finally {
            this.session.refreshing(false);
          }
        }
      );

      return true;

    } catch {
      return false;
    }
  }

  async ensureAuthenticated():
    Promise<void> {

    if (!this.client) {
      this.rebuild();
    }

    try {
      await this.client!.v2.me();

      this.session.authenticated();

      return;

    } catch (error: any) {

      const status =
        error?.code ??
        error?.data?.status;

      if (status !== 401) {
        throw error;
      }
    }

    console.log(
      "[X OAuth] Access token rejected; refreshing OAuth2 session."
    );

    this.session.refreshing(true);

    try {
      await this.refresh.run();

      this.rebuild();

      await this.client!.v2.me();

      this.session.authenticated();

      console.log(
        "[X OAuth] OAuth2 session refreshed successfully."
      );

    } finally {
      this.session.refreshing(false);
    }
  }

  rebuild(): void {

    const tokens =
      this.store.load();

    if (!tokens.accessToken) {
      throw new Error(
        "X OAuth2 access token is missing."
      );
    }

    this.client =
      new TwitterApi(
        tokens.accessToken
      );
  }

  api(): TwitterApi {

    if (!this.client) {
      this.rebuild();
    }

    return this.client!;
  }
}
