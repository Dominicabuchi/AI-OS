import { MCPClient } from "@ai-os/mcp-host";

export class RedditMCP {

  private client =
    new MCPClient({
      type: "stdio",
      command: "reddit-mcp-server",
    });

  private connected = false;

  async connect() {

    if (this.connected) {
      return;
    }

    await this.client.connect();

    this.connected = true;

  }

  async listTools() {

    await this.connect();

    return this.client.listTools();

  }

  async call(

    tool: string,

    args: unknown

  ) {

    await this.connect();

    return this.client.call(

      tool,

      args

    );

  }

}
