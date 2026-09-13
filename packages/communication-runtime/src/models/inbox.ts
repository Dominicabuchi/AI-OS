import { Conversation } from "./conversation";
import { MessageThread } from "./thread";

export interface Inbox {

  listThreads(): Promise<MessageThread[]>;

  openThread(
    id: string
  ): Promise<MessageThread>;

  readThread(
    id: string
  ): Promise<Conversation>;

  search(
    query: string
  ): Promise<MessageThread[]>;

  unread(): Promise<MessageThread[]>;

}
