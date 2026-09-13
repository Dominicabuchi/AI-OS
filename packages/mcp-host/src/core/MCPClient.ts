import { JSONRPC } from "./JSONRPC";
import { MCPProcess } from "./MCPProcess";
import { MCPHttpTransport } from "./MCPHttpTransport";
import {
  MCPRemoteConfig,
  MCPResponse
} from "./types";

type MCPMode =
  | {
      type: "stdio";
      command: string;
      args?: string[];
      env?: NodeJS.ProcessEnv;
    }
  | {
      type: "http";
      remote: MCPRemoteConfig;
    };

export class MCPClient {

  private process?: MCPProcess;
  private rpc?: JSONRPC;
  private http?: MCPHttpTransport;

  constructor(config: MCPMode) {

    if (config.type === "stdio") {

      this.process = new MCPProcess(
        config.command,
        config.args ?? [],
        config.env ?? process.env
      );

    } else {

      this.http =
        new MCPHttpTransport(config.remote);

    }
  }

  async connect(): Promise<void> {

    if (this.http) {

      await this.http.connect();

      return;
    }

    if (!this.process)
      throw new Error("No MCP transport configured.");

    this.process.start();

    this.rpc = new JSONRPC(
      this.process.stdout(),
      this.process.stdin()
    );

    await this.rpc.call(
      "initialize",
      {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: {
          name: "AI-OS",
          version: "1.0.0"
        }
      }
    );
  }

  async listTools(): Promise<MCPResponse> {

    if (this.http) {

      return this.http.call(
        "tools/list"
      );
    }

    if (!this.rpc)
      throw new Error("Not connected.");

    return this.rpc.call(
      "tools/list"
    );
  }

  async call(
    tool: string,
    args: unknown
  ): Promise<MCPResponse> {

    const params = {
      name: tool,
      arguments: args
    };

    if (this.http) {

      return this.http.call(
        "tools/call",
        params
      );
    }

    if (!this.rpc)
      throw new Error("Not connected.");

    return this.rpc.call(
      "tools/call",
      params
    );
  }
}
