import { HumanBrowser } from "@ai-os/browser-runtime";

export interface Contact {
  id: string;
  name: string;
  profileUrl?: string;
}

export abstract class BrowserContacts {

  constructor(
    protected readonly human: HumanBrowser
  ) {}

  abstract search(query: string): Promise<Contact[]>;

  abstract open(id: string): Promise<void>;

}
