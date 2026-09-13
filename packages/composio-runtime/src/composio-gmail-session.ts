
import "dotenv/config";

import { Composio } from "@composio/core";

export interface ComposioMCPConnection {
  url: string;
  headers: Record<string, string>;
  sessionId: string;
}

export class ComposioGmailSession {

  private static instance?: ComposioGmailSession;

  private readonly composio: Composio;

  private session?: any;

  private connection?: ComposioMCPConnection;

  private constructor() {

    const apiKey =
      process.env.COMPOSIO_API_KEY;

    if (!apiKey) {

      throw new Error(
        "COMPOSIO_API_KEY is not configured."
      );
    }

    this.composio =
      new Composio({
        apiKey
      });
  }

  static getInstance():
    ComposioGmailSession {

    if (!this.instance) {

      this.instance =
        new ComposioGmailSession();
    }

    return this.instance;
  }

  async getConnection():
    Promise<ComposioMCPConnection> {

    if (this.connection) {
      return this.connection;
    }

    /*
     * Universal AI-OS Composio session.
     *
     * IMPORTANT:
     *
     * Do NOT restrict this session to Gmail.
     *
     * Composio's meta-tools can dynamically discover
     * tools across the catalog.
     */
    this.session =
      await this.composio.sessions.create(
        "ai-os-primary",
        {
          mcp: true
        }
      );

    if (!this.session?.mcp?.url) {

      throw new Error(
        "Composio MCP URL was not returned."
      );
    }

    const headers =
      this.session.mcp.headers ?? {};

    this.connection = {

      url:
        this.session.mcp.url,

      headers,

      sessionId:
        this.session.sessionId
    };

    return this.connection;
  }

  async refresh():
    Promise<ComposioMCPConnection> {

    this.connection =
      undefined;

    this.session =
      undefined;

    return this.getConnection();
  }

  getSessionId():
    string | undefined {

    return this.session?.sessionId;
  }
}
