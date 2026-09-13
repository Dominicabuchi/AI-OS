import { HumanBrowser } from "@ai-os/browser-runtime";

export interface LinkedInNotification {
  id: string;
  text: string;
  url: string;
  read: boolean;
}

export class LinkedInNotifications {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(): Promise<void> {
    await this.human.goto("https://www.linkedin.com/notifications/");
  }

  async list(): Promise<LinkedInNotification[]> {
    await this.open();

    return await this.human.evaluate(() =>
      Array.from(document.querySelectorAll("a")).slice(0, 100).map((a: any) => ({
        id: a.href,
        text: a.innerText || "",
        url: a.href,
        read: false
      }))
    );
  }

  async unread(): Promise<LinkedInNotification[]> {
    return (await this.list()).filter(n => !n.read);
  }

  async markRead(): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "notifications",
      action: "mark-read",
      description: "Mark notification as read"
    });
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }

}
