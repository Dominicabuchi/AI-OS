export interface OAuthSession {

  accessToken: string;

  refreshToken: string;

  authenticated: boolean;

  refreshing: boolean;

  lastRefresh?: Date;

}
