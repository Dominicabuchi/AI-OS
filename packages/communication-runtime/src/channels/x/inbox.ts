import { HumanBrowser } from "@ai-os/browser-runtime";
import { BrowserInbox } from "../../core/browser-inbox";
import { Conversation } from "../../models/conversation";
import { MessageThread } from "../../models/thread";
import { XConfig } from "./config";
import { XNavigator } from "./navigator";

export class XInbox extends BrowserInbox {

  private readonly navigator: XNavigator;

  constructor(
    human: HumanBrowser
  ) {
    super(human);

    this.navigator =
      new XNavigator(human);
  }

  
  async listThreads(): Promise<MessageThread[]> {

    await this.navigator.inbox();

    await this.human.page.waitForSelector(
      XConfig.selectors.conversationList!,
      {
        state: "visible",
        timeout: 30000
      }
    );

    await this.human.page.waitForFunction(() => {
      return document.querySelectorAll(
        "li.msg-conversation-listitem"
      ).length > 0;
    });

    const items =
      this.human.page.locator(
        XConfig.selectors.conversationItem!
      );

    const count = await items.count();

    console.log("Conversation count:", count);

    const threads: MessageThread[] = [];

    for (let i = 0; i < count; i++) {

      const item = items.nth(i);

      const participant =
        await item
          .locator(
            ".msg-conversation-listitem__participant-names"
          )
          .textContent()
          .catch(() => "");

      const snippet =
        await item
          .locator(
            ".msg-conversation-card__message-snippet"
          )
          .textContent()
          .catch(() => "");

      const unread =
        await item
          .locator(
            XConfig.selectors.unreadBadge!
          )
          .count() > 0;

      threads.push({
        id: String(i),
        participants: [
          (participant ?? "").trim()
        ],
        unread,
        lastMessage: (snippet ?? "").trim()
      });

    }

    return threads;

  }


  async unread(): Promise<MessageThread[]> {

    return this.listThreads();

  }

  async search(
    query: string
  ): Promise<MessageThread[]> {

    const threads =
      await this.listThreads();

    return threads.filter(t =>
      t.participants
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

  }

  async openThread(
    id: string
  ): Promise<MessageThread> {

    const items =
      await this.human.locator(
        XConfig.selectors.conversationItem!
      );

    await items
      .nth(Number(id))
      .click();

    const title =
      await items
        .nth(Number(id))
        .innerText();

    return {
      id,
      participants: [title],
      unread: false,
      lastMessage: title
    };

  }



  async readThread(
    id: string
  ): Promise<Conversation> {

    await this.openThread(id);

    await this.human.page.waitForSelector(
      XConfig.selectors.messageBubble!,
      {
        state: "visible",
        timeout: 30000
      }
    );

    const messages = await this.human.page.locator(
      XConfig.selectors.messageBubble!
    ).evaluateAll(nodes => {

      return nodes.map((node, index) => ({

        id: String(index),

        threadId: "",

        sender: "",

        body: node.textContent?.trim() ?? "",

        timestamp: new Date(),

        outgoing: false,

        read: true

      }));

    });

    const thread = await this.openThread(id);

    return {

      threadId: id,

      participants: thread.participants,

      messages

    };

  }


}
