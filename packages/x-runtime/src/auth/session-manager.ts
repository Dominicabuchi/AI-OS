import { OAuthState } from "./oauth-state";

export class SessionManager {

  private readonly state: OAuthState = {

    initialized: false,

    authenticated: false,

    refreshing: false,

  };

  get snapshot(): OAuthState {
    return { ...this.state };
  }

  initialize(): void {
    this.state.initialized = true;
  }

  authenticated(): void {
    this.state.authenticated = true;
    this.state.lastVerification = new Date();
  }

  refreshing(active: boolean): void {
    this.state.refreshing = active;

    if (!active) {
      this.state.lastRefresh = new Date();
    }
  }

  expires(date: Date): void {
    this.state.expiresAt = date;
  }

}
