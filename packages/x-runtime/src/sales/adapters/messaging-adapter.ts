export interface MessagingAdapter {

  send(
    conversationId: string,
    text: string,
  ): Promise<void>;

  read(
    conversationId: string,
  ): Promise<string[]>;

  conversationExists(
    conversationId: string,
  ): Promise<boolean>;

  openOrCreate(
    username: string,
  ): Promise<string>;

  typing(
    conversationId: string,
  ): Promise<void>;

  markRead(
    conversationId: string,
  ): Promise<void>;

  archive(
    conversationId: string,
  ): Promise<void>;

}
