import {
  MCPResponse,
  MCPRemoteConfig,
  MCPTransport
} from "./types";

export class MCPHttpTransport implements MCPTransport {

  private readonly url: string;

  private readonly headers: Record<string, string>;

  constructor(
    config: MCPRemoteConfig
  ) {

    this.url = config.url;

    this.headers = {
      "Content-Type": "application/json",
      "Accept":
        "application/json, text/event-stream",
      ...(config.headers ?? {})
    };
  }

  async connect(): Promise<void> {
    /*
     * HTTP MCP connections are established lazily.
     *
     * The first JSON-RPC request establishes the
     * actual remote interaction.
     */
  }

  async close(): Promise<void> {
    /*
     * HTTP transport has no persistent child process.
     */
  }

  private parseSSE(
    body: string
  ): MCPResponse {

    const events =
      body
        .split(/\r?\n\r?\n/)
        .map(block => block.trim())
        .filter(Boolean);

    /*
     * MCP servers may return multiple SSE events.
     *
     * We want the JSON-RPC message contained in
     * the data field.
     */
    for (const event of events) {

      const dataLines =
        event
          .split(/\r?\n/)
          .filter(line =>
            line.startsWith("data:")
          )
          .map(line =>
            line.slice(5).trim()
          );

      if (!dataLines.length)
        continue;

      const data =
        dataLines.join("\n");

      if (!data || data === "[DONE]")
        continue;

      try {

        return JSON.parse(
          data
        ) as MCPResponse;

      } catch {
        /*
         * Continue searching other SSE events
         * instead of immediately failing.
         */
      }
    }

    throw new Error(
      `Remote MCP SSE response did not contain a valid JSON-RPC message: ${body.slice(0, 1000)}`
    );
  }

  private parseResponse(
    body: string,
    contentType: string
  ): MCPResponse {

    /*
     * Standard JSON MCP response.
     */
    if (
      contentType
        .toLowerCase()
        .includes("application/json")
    ) {

      try {

        return JSON.parse(
          body
        ) as MCPResponse;

      } catch {

        throw new Error(
          `Remote MCP returned invalid JSON: ${body.slice(0, 1000)}`
        );
      }
    }

    /*
     * MCP commonly uses Server-Sent Events
     * for streaming HTTP transport.
     */
    if (
      contentType
        .toLowerCase()
        .includes("text/event-stream")
      ||
      body.includes("event:")
      ||
      body.includes("data:")
    ) {

      return this.parseSSE(body);
    }

    /*
     * Some MCP gateways do not provide a useful
     * content-type. Attempt JSON first, then SSE.
     */
    try {

      return JSON.parse(
        body
      ) as MCPResponse;

    } catch {

      return this.parseSSE(body);
    }
  }

  async call(
    method: string,
    params?: unknown
  ): Promise<MCPResponse> {

    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      ...(params === undefined
        ? {}
        : { params })
    };

    const response =
      await fetch(
        this.url,
        {
          method: "POST",

          headers: this.headers,

          body:
            JSON.stringify(request)
        }
      );

    const body =
      await response.text();

    if (!response.ok) {

      throw new Error(
        `Remote MCP HTTP ${response.status}: ${body.slice(0, 1000)}`
      );
    }

    return this.parseResponse(
      body,
      response.headers.get(
        "content-type"
      ) ?? ""
    );
  }
}
