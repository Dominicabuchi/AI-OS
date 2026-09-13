import { Tool } from "../types/tool";
import { execute } from "@ai-os/task-runtime";

import crypto from "crypto";

export class TaskTool implements Tool {

  readonly id = "task";

  readonly name = "Task";

  readonly description = "Task execution";

  canExecute(
    action: string
  ): boolean {

    return action.startsWith("task.");

  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    switch (action) {

      case "task.create":

        return execute({
          id: crypto.randomUUID(),
          missionId: String(
            payload.missionId ?? "runtime"
          ),
          title: String(payload.title),
          status: "pending"
        });

      default:

        throw new Error(
          `Unsupported task action: ${action}`
        );

    }

  }

}
