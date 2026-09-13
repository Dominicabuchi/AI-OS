
import { Tool } from "../types/tool";

import {
  ComposioGmailSession
} from "@ai-os/composio-runtime";

import { MCPClient } from "@ai-os/mcp-host";

export class ComposioTool implements Tool {

  readonly id = "composio";

  readonly name =
    "Composio";

  readonly description =
    "Universal Composio integration layer for discovering, authenticating and executing external application tools.";

  private client?: MCPClient;

  private async getClient(): Promise<MCPClient> {

    if (this.client) {
      return this.client;
    }

    const session =
      await ComposioGmailSession
        .getInstance()
        .getConnection();

    this.client =
      new MCPClient({
        type: "http",
        remote: {
          url: session.url,
          headers: session.headers
        }
      });

    await this.client.connect();

    return this.client;
  }

  canExecute(
    action: string
  ): boolean {

    /*
     * Composio exposes discovered application actions using
     * their canonical uppercase tool slugs, for example:
     *
     *   GMAIL_FETCH_EMAILS
     *   GITHUB_GET_REPOSITORY_CONTENT
     *   HUNTER_EMAIL_FINDER
     *   APOLLO_PEOPLE_SEARCH
     *
     * Keep explicit composio.* meta-actions supported while
     * also accepting canonical Composio action slugs.
     */
    return (
      action.startsWith("composio.") ||
      /^[A-Z][A-Z0-9_]+$/.test(action)
    );
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const client = await this.getClient();

    const metaActions: Record<string, string> = {
      "composio.search_tools": "COMPOSIO_SEARCH_TOOLS",
      "composio.get_tool_schemas": "COMPOSIO_GET_TOOL_SCHEMAS",
      "composio.manage_connections": "COMPOSIO_MANAGE_CONNECTIONS",
      "composio.execute": "COMPOSIO_MULTI_EXECUTE_TOOL",
      "composio.remote_bash": "COMPOSIO_REMOTE_BASH_TOOL",
      "composio.workbench": "COMPOSIO_REMOTE_WORKBENCH",
      "composio.list_toolkits": "COMPOSIO_LIST_TOOLKITS"
    };

    /*
     * Meta-actions remain available exactly as before.
     */
    if (metaActions[action]) {
      return client.call(
        metaActions[action],
        payload
      );
    }

    /*
     * Any discovered Composio action can be executed through
     * the universal executor:
     *
     * {
     *   action: "gmail.send",
     *   payload: {
     *     tool_slug: "GMAIL_SEND_DRAFT",
     *     arguments: {...}
     *   }
     * }
     *
     * Or:
     *
     * {
     *   action: "composio.action",
     *   payload: {
     *     tool_slug: "...",
     *     arguments: {...}
     *   }
     * }
     */

    const toolSlug =
      typeof payload.tool_slug === "string"
        ? payload.tool_slug
        : typeof payload.slug === "string"
          ? payload.slug
          : action.startsWith("composio.")
            ? undefined
            : action;

    if (!toolSlug) {
      throw new Error(
        `Composio action "${action}" requires payload.tool_slug`
      );
    }

    const toolArguments =
      payload.arguments &&
      typeof payload.arguments === "object"
        ? payload.arguments
        : Object.fromEntries(
            Object.entries(payload).filter(
              ([key]) =>
                key !== "tool_slug" &&
                key !== "slug" &&
                key !== "arguments"
            )
          );

    return client.call(
      "COMPOSIO_MULTI_EXECUTE_TOOL",
      {
        tools: [
          {
            tool_slug: toolSlug,
            arguments: toolArguments
          }
        ]
      }
    );
  }
}
