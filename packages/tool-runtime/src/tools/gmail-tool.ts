
import { Tool } from "../types/tool";

import {
  ComposioGmailSession
} from "@ai-os/composio-runtime";

import { MCPClient } from "@ai-os/mcp-host";

import {
  GmailBrowserFallback
} from "@ai-os/communication-runtime";

export class GmailTool implements Tool {

  readonly id = "gmail";

  readonly name = "Gmail";

  readonly description =
    "Gmail through Composio MCP with Adaptive Browser fallback.";

  private client?: MCPClient;

  private browserFallback?: GmailBrowserFallback;

  private async getClient(): Promise<MCPClient> {

    if (this.client) {
      return this.client;
    }

    const connection =
      await ComposioGmailSession
        .getInstance()
        .getConnection();

    this.client =
      new MCPClient({
        type: "http",
        remote: {
          url: connection.url,
          headers: connection.headers
        }
      });

    await this.client.connect();

    return this.client;
  }

  private getBrowserFallback(): GmailBrowserFallback {

    if (!this.browserFallback) {

      this.browserFallback =
        new GmailBrowserFallback();
    }

    return this.browserFallback;
  }

  canExecute(action: string): boolean {
    return action.startsWith("gmail.");
  }

  private resolveToolSlug(
    action: string
  ): string {

    const actions: Record<string, string> = {

      "gmail.search":
        "GMAIL_FETCH_EMAILS",

      "gmail.list":
        "GMAIL_FETCH_EMAILS",

      "gmail.read":
        "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",

      "gmail.send":
        "GMAIL_SEND_EMAIL",

      "gmail.reply":
        "GMAIL_REPLY_TO_THREAD",

      "gmail.create_draft":
        "GMAIL_CREATE_EMAIL_DRAFT",

      "gmail.send_draft":
        "GMAIL_SEND_DRAFT",

      "gmail.get_draft":
        "GMAIL_GET_DRAFT",

      "gmail.update_draft":
        "GMAIL_UPDATE_DRAFT",

      "gmail.list_threads":
        "GMAIL_LIST_THREADS",

      "gmail.read_thread":
        "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",

      "gmail.get_attachment":
        "GMAIL_GET_ATTACHMENT",

      "gmail.search_people":
        "GMAIL_SEARCH_PEOPLE"
    };

    const slug = actions[action];

    if (!slug) {

      throw new Error(
        `Unsupported Gmail action: ${action}`
      );
    }

    return slug;
  }

  private async executeComposio(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const client =
      await this.getClient();

    const tool =
      this.resolveToolSlug(action);

    const response =
      await client.call(
        "tools/call",
        {
          name: "COMPOSIO_MULTI_EXECUTE_TOOL",
          arguments: {
            tools: [
              {
                tool_slug: tool,
                arguments: payload
              }
            ]
          }
        }
      );

    if (response.error) {
      throw new Error(
        `Composio Gmail MCP error ${response.error.code}: ${response.error.message}`
      );
    }

    const result: any =
      response.result;

    const containsExplicitFailure =
      (value: unknown): boolean => {
        if (!value || typeof value !== "object") {
          return false;
        }

        if (Array.isArray(value)) {
          return value.some(
            containsExplicitFailure
          );
        }

        const obj =
          value as Record<string, unknown>;

        if (
          obj.success === false ||
          obj.successful === false ||
          obj.ok === false ||
          obj.isError === true
        ) {
          return true;
        }

        return Object.values(obj).some(
          containsExplicitFailure
        );
      };

    if (
      result === undefined ||
      containsExplicitFailure(result)
    ) {
      throw new Error(
        "Composio Gmail action returned no valid result or reported an application-level failure."
      );
    }

    return response;
  }

  private async executeBrowserFallback(
    action: string,
    payload: Record<string, unknown>,
    originalError: unknown
  ): Promise<unknown> {

    const fallback =
      this.getBrowserFallback();

    switch (action) {

      case "gmail.send":

        if (!payload.to) {
          throw new Error(
            "gmail.send fallback requires payload.to"
          );
        }

        return fallback.send({
          to: String(payload.to),
          subject: String(
            payload.subject ?? ""
          ),
          body: String(
            payload.body ?? ""
          ),
          html: payload.html
            ? String(payload.html)
            : undefined
        });

      case "gmail.reply":

        return fallback.reply({
          body: String(
            payload.body ?? ""
          ),
          threadId: payload.threadId
            ? String(payload.threadId)
            : undefined
        });

      default:

        throw new Error(
          `Composio Gmail action failed and browser fallback is not implemented for ${action}. Original error: ${
            originalError instanceof Error
              ? originalError.message
              : String(originalError)
          }`
        );
    }
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    /*
     * Primary path: Composio MCP.
     */
    try {

      return await this.executeComposio(
        action,
        payload
      );

    } catch (error) {

      /*
       * Recovery path: Adaptive Browser.
       *
       * Only communication actions with an implemented
       * browser fallback are allowed to fall through.
       */
      return this.executeBrowserFallback(
        action,
        payload,
        error
      );
    }
  }
}
