export type Channel =
  | "gmail"
  | "outlook"
  | "linkedin"
  | "x"
  | "reddit"
  | "discord"
  | "slack"
  | "sms";

export interface Message {
  id?: string;
  channel: Channel;
  to: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}
