import { HumanBrowser } from "@ai-os/browser-runtime";

export interface XNotification {
  id: string;
  text: string;
  read: boolean;
}

export class XNotifications {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(): Promise<void> {
    await this.human.goto("https://x.com/notifications");
  }

  async list(): Promise<XNotification[]> {

    await this.open();

    return await this.human.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="cellInnerDiv"]'))
        .map((item:any,index)=>({

          id: String(index),

          text: item.innerText,

          read: !item.innerText.toLowerCase().includes("new")

        }))
    );

  }

  async unread(): Promise<XNotification[]> {
    return (await this.list()).filter(n => !n.read);
  }

  async markRead(): Promise<void> {

    await this.human.adaptiveClick({

      platform:"x",

      page:"notifications",

      action:"mark-read",

      description:"Mark notification as read"

    });

  }

  async next(): Promise<void> {

    this.cursor++;

    await this.human.scroll();

  }

}
