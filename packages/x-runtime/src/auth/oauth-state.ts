export interface OAuthState {

  initialized: boolean;

  authenticated: boolean;

  refreshing: boolean;

  lastVerification?: Date;

  lastRefresh?: Date;

  expiresAt?: Date;

}
