import { getTools } from "../registry";

export interface ToolHealth {

  id: string;

  healthy: boolean;

}

export function getToolHealth(): ToolHealth[] {

  return getTools().map(tool => ({

    id: tool.id,

    healthy: true

  }));

}
