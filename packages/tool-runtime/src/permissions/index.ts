import { Tool } from "../types/tool";

export function canUseTool(
  tool: Tool,
  permissions: string[] = []
): boolean {

  if (
    permissions.length === 0
  ) {
    return true;
  }

  return permissions.includes(
    tool.id
  );

}
