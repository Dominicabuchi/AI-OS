
import { Tool } from "../types/tool";

import {
  CommunicationManager,
  LinkedInChannel,
  XChannel
} from "@ai-os/communication-runtime";

import {
  BrowserManager
} from "@ai-os/browser-runtime";

import {
  getTool
} from "../registry";

export class CommunicationTool implements Tool {

  readonly id = "communication";

  readonly name = "Communication";

  readonly description =
    "Coordinate communication across AI-OS channels.";

  private readonly browser =
    new BrowserManager();

  private readonly manager =
    new CommunicationManager();

  private initialized = false;

  canExecute(action: string): boolean {

    return action.startsWith(
      "communication."
    );
  }

  private async initialize(): Promise<void> {

    if (this.initialized) {
      return;
    }

    /*
     * Register browser-backed communication
     * channels lazily.
     *
     * Browser startup itself remains lazy inside
     * the individual BrowserChannel.
     */

    this.manager.register(
      "linkedin",
      new LinkedInChannel(
        this.browser
      )
    );

    this.manager.register(
      "x",
      new XChannel(
        this.browser
      )
    );

    this.initialized = true;
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    switch (action) {

      case "communication.send": {

        const channel =
          String(
            payload.channel ?? ""
          ).toLowerCase();

        /*
         * Gmail has its own first-class tool because
         * it has Composio MCP + Adaptive Browser
         * fallback.
         *
         * Reuse that implementation rather than
         * duplicating Gmail logic here.
         */
        if (channel === "gmail") {

          const gmail =
            getTool("gmail");

          return gmail.execute(
            "gmail.send",
            {
              to: payload.to,
              subject:
                payload.subject ?? "",
              body:
                payload.body ?? "",
              html:
                payload.html
            }
          );
        }

        /*
         * Browser/runtime-backed channels.
         */
        await this.initialize();

        if (
          channel !== "linkedin" &&
          channel !== "x"
        ) {

          throw new Error(
            `Communication channel "${channel}" is not registered. ` +
            `Available channels: gmail, linkedin, x.`
          );
        }

        return this.manager.send({
          channel,
          body: String(
            payload.body ?? ""
          ),
          ...(payload.to !== undefined
            ? { to: String(payload.to) }
            : {}),
          ...(payload.threadId !== undefined
            ? {
                threadId:
                  String(payload.threadId)
              }
            : {}),
          ...(payload.subject !== undefined
            ? {
                subject:
                  String(payload.subject)
              }
            : {})
        } as any);
      }

      default:

        throw new Error(
          `Unsupported communication action: ${action}`
        );
    }
  }
}
