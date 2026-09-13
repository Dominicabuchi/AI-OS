import { HumanBrowser } from "@ai-os/browser-runtime";

import { Conversation } from "../models/conversation";
import { Inbox } from "../models/inbox";
import { MessageThread } from "../models/thread";

export abstract class BrowserInbox
  implements Inbox {

  constructor(
    protected readonly human: HumanBrowser
  ) {}

  async listThreads(): Promise<MessageThread[]> {
    return [];
  }

  async openThread(
    id: string
  ): Promise<MessageThread> {
    throw new Error("Not implemented.");
  }

  async readThread(
    id: string
  ): Promise<Conversation> {
    throw new Error("Not implemented.");
  }

  async search(
    query: string
  ): Promise<MessageThread[]> {
    return [];
  }

  async unread(): Promise<MessageThread[]> {
    return [];
  }

}
