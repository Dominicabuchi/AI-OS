import {

  ChildProcessWithoutNullStreams,

  spawn

} from "child_process";

export class MCPProcess {

  private process?:
    ChildProcessWithoutNullStreams;

  constructor(

    private readonly command: string,

    private readonly args: string[] = [],

    private readonly env:
      NodeJS.ProcessEnv = process.env

  ) {}

  start() {

    console.log("");

    console.log("=================================");
    console.log("Starting MCP Server");
    console.log("=================================");

    console.log("Command:", this.command);

    this.process = spawn(

      "npx",

      [

        "-y",

        this.command,

        ...this.args

      ],

      {

        env: this.env,

        stdio: "pipe"

      }

    );

    this.process.on(

      "error",

      error => {

        console.error("");

        console.error("=================================");

        console.error("MCP PROCESS ERROR");

        console.error("=================================");

        console.error(error);

      }

    );

    this.process.stdout.on(

      "data",

      data =>

        console.log(

          "[MCP OUT]",

          data.toString()

        )

    );

    this.process.stderr.on(

      "data",

      data =>

        console.error(

          "[MCP ERR]",

          data.toString()

        )

    );

    this.process.on(

      "exit",

      code =>

        console.log(

          "[MCP EXIT]",

          code

        )

    );

  }

  stdin() {

    if (!this.process) {

      throw new Error(

        "MCP not started."

      );

    }

    return this.process.stdin;

  }

  stdout() {

    if (!this.process) {

      throw new Error(

        "MCP not started."

      );

    }

    return this.process.stdout;

  }

}
