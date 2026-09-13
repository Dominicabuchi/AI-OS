import { HumanBrowser } from "@ai-os/browser-runtime";

export abstract class BrowserMonitor {

  constructor(
    protected readonly human: HumanBrowser
  ) {}

  abstract watchInbox(): Promise<void>;

  abstract watchNotifications(): Promise<void>;

  abstract stop(): Promise<void>;

}
