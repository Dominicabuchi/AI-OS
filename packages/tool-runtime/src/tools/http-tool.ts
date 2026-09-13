import { Tool } from "../types/tool";

export class HttpTool implements Tool {

  readonly id = "http";

  readonly name = "HTTP";

  readonly description = "HTTP client";

  canExecute(action: string): boolean {
    return action.startsWith("http.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const url = String(payload.url);

    const options: RequestInit = {
      method: String(payload.method ?? "GET"),
      headers: payload.headers as HeadersInit | undefined,
      body: payload.body
        ? JSON.stringify(payload.body)
        : undefined
    };

    switch (action) {

      case "http.request": {

        const response = await fetch(url, options);

        const headers: Record<string, string> = {};

        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        return {
          status: response.status,
          headers,
          body: await response.text()
        };

      }

      default:

        throw new Error(
          `Unsupported HTTP action: ${action}`
        );

    }

  }

}
