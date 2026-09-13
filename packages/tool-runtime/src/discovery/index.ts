import { getTools } from "../registry";
import { Tool } from "../types/tool";

export function discoverTools(): Tool[] {
  return getTools();
}

export function discoverByAction(
  action: string
): Tool[] {

  return getTools().filter(tool =>
    tool.canExecute(action)
  );

}
