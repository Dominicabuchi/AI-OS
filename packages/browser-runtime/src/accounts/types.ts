export type Platform =
  | "linkedin"
  | "x"
  | "reddit";

export interface Account {

  platform: Platform;

  profile: string;

  createdAt: string;

  lastUsed: string;

}

export interface AccountsConfig {

  linkedin?: Account;

  x?: Account;

  reddit?: Account;

}
