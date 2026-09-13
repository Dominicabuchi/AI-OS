import { HumanBrowser } from "@ai-os/browser-runtime";
import { XClient } from "../client";
import { XTransport } from "../transport/x-transport";
import { MessagingContext } from "./core/context";

export interface XMessage {
  id: string;
  sender: string;
  text: string;
  timestamp?: string;
}

export class XMessaging {

  private cursor = 0;
  private conversations: XMessage[] = [];

  private readonly context = new MessagingContext();

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async open(): Promise<void> {
    await this.human.goto("https://x.com/messages");
  }


  async list(): Promise<XMessage[]> {

    return await XTransport.execute<XMessage[]>(

      async () => {

        const events = await XClient.v2.listDmEvents({
          max_results: 50
        });

        this.conversations = (events.data.data ?? []).map((event:any) => ({

          id: event.dm_conversation_id ?? event.id,

          sender: event.sender_id ?? "",

          text: event.text ?? "",

          timestamp: event.created_at

        }));


        for (const c of this.conversations) {

          this.context.conversations.set({

            id: c.id,

            participant: {
              id: c.sender
            },

            messages: [],

            lastMessage: {
              id: c.id,
              conversationId: c.id,
              senderId: c.sender,
              text: c.text,
              createdAt: c.timestamp
            },

            unreadCount: 0

          });

          this.context.messages.set({

            id: c.id,

            conversationId: c.id,

            senderId: c.sender,

            text: c.text,

            createdAt: c.timestamp

          });

          this.context.participants.register({
            id: c.sender
          });

        }

        return this.conversations;


      },

      async () => {

        await this.open();

        this.conversations = await this.human.page.evaluate(() =>
          Array.from(document.querySelectorAll('[data-testid="cellInnerDiv"]'))
            .map((item:any,index)=>({

              id:String(index),

              sender:
                item.innerText.split("\\n")[0] ?? "",

              text:
                item.innerText

            }))
        );

        return this.conversations;

        return this.conversations;

      }

    );

  }


  async read(): Promise<string[]> {

    return await this.human.page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="messageEntry"]'))
        .map((m:any)=>m.innerText)
    );

  }


  async send(text:string): Promise<void> {

    await XTransport.execute(

      async () => {

        throw new Error("API send requires a conversation or participant ID.");

      },

      async () => {

        await this.human.adaptiveType({

          platform:"x",

          page:"messages",

          action:"message-box",

          description:"DM input",

          text

        });

        await this.human.adaptivePress(
          {
            platform:"x",
            page:"messages",
            action:"message-box",
            description:"DM input"
          },
          "Enter"
        );

        return {} as any;

      }

    );

  }


  async reply(text:string): Promise<void> {
    await this.send(text);
  }

  async openConversation(id: string): Promise<void> {

    await this.open();

    const rows = await this.human.page.locator('[data-testid="cellInnerDiv"]').all();

    const index = Number(id);

    if (Number.isNaN(index) || index < 0 || index >= rows.length) {
      throw new Error(`Conversation not found: ${id}`);
    }

    await rows[index].click();

  }


  async readConversation(id: string): Promise<string[]> {

    return await XTransport.execute<string[]>(

      async () => {

        const events = await XClient.v2.listDmEventsOfConversation(id);

        return (events.data.data ?? []).map(
          (event:any) => event.text ?? ""
        );

      },

      async () => {

        await this.openConversation(id);

        return await this.read();

      }

    );

  }


  async searchConversations(query: string): Promise<XMessage[]> {

    await this.open();

    await this.human.adaptiveType({

      platform: "x",

      page: "messages",

      action: "search",

      description: "Search conversations",

      text: query

    });

    await this.human.page.waitForTimeout(1000);

    return await this.list();

  }

  async listUnread(): Promise<XMessage[]> {

    const conversations = await this.list();

    return conversations.filter(c =>
      c.text.toLowerCase().includes("unread")
    );

  }

  async delete(): Promise<void> {

    await this.human.adaptiveClick({

      platform:"x",

      page:"messages",

      action:"delete",

      description:"Delete conversation"

    });

  }

  async next(): Promise<void> {

    this.cursor++;

    await this.human.scroll();

  }

}
