export interface RedditAccount {

  id: string;

  username: string;

  displayName?: string;

  profilePath: string;

  cookiesPath: string;

  storagePath: string;

  enabled: boolean;

  lastLogin?: Date;

  lastSeen?: Date;

}
