import { HumanBrowser } from "@ai-os/browser-runtime";

export abstract class BrowserConversation {

  constructor(
    protected readonly human: HumanBrowser
  ) {}

  abstract open(id: string): Promise<void>;

  abstract reply(message: string): Promise<void>;

  abstract messages(): Promise<string[]>;

  abstract lastMessage(): Promise<string | null>;

}
