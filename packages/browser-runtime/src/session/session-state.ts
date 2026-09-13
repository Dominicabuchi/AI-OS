export interface SessionState {

  platform: string;

  authenticated: boolean;

  lastValidated: Date;

  userId?: string;

  username?: string;

}
