import { getToolForAction } from "@ai-os/tool-runtime";
import { Action } from "../types/action";

export class ActionExecutor {

  async execute(
    action: Action
  ) {

    const tool = getToolForAction(
      action.type
    );

    return tool.execute(
      action.type,
      action.payload
    );

  }

  async close() {}

}
