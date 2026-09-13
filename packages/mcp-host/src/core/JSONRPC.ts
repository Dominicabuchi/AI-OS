import { EventEmitter } from "events";
import { Writable, Readable } from "stream";

import {
  MCPRequest,
  MCPResponse
} from "./types";

export class JSONRPC extends EventEmitter {

  private id = 1;

  private buffer = "";

  private pending =
    new Map<
      number,
      (response: MCPResponse) => void
    >();

  constructor(

    private readonly input: Readable,

    private readonly output: Writable

  ) {

    super();

    this.input.on(
      "data",
      chunk => this.consume(
        chunk.toString()
      )
    );

  }

  async call(

    method: string,

    params?: unknown

  ): Promise<MCPResponse> {

    const id = this.id++;

    const request: MCPRequest = {

      jsonrpc: "2.0",

      id,

      method,

      params

    };

    const payload =
      JSON.stringify(request) + "\n";

    this.output.write(payload);

    return new Promise(resolve => {

      this.pending.set(

        id,

        resolve

      );

    });

  }

  private consume(
    chunk: string
  ) {

    this.buffer += chunk;

    const messages =
      this.buffer.split("\n");

    this.buffer =
      messages.pop() ?? "";

    for (const message of messages) {

      if (!message.trim()) {
        continue;
      }

      const response =
        JSON.parse(message);

      if (
        response.id &&
        this.pending.has(
          response.id
        )
      ) {

        this.pending
          .get(response.id)!
          (response);

        this.pending.delete(
          response.id
        );

      }

      this.emit(
        "message",
        response
      );

    }

  }

}
