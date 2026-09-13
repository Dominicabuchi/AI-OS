export type RedditAccountRole =
  | "recruiter"
  | "seller"
  | "customer";

export interface RedditAccount {

  id: string;

  username: string;

  email?: string;

  password?: string;

  role: RedditAccountRole;

  enabled: boolean;

  initialized: boolean;

  authenticated: boolean;

  profilePath: string;

  sessionPath: string;

  cookiesPath: string;

  storagePath: string;

  createdAt: number;

  lastLogin?: number;

  lastAuthenticated?: number;

  lastCookieSave?: number;

  lastStorageSave?: number;

  lastSessionCheck?: number;

}
