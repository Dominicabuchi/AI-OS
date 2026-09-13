import { Agent } from "../types/agent";

const registry = new Map<string, Agent>();

export function registerAgent(
  agent: Agent
): void {

  registry.set(agent.id, agent);

}

export function getAgent(
  id: string
): Agent {

  const agent = registry.get(id);

  if (!agent)
    throw new Error(`Unknown agent: ${id}`);

  return agent;

}

export function getAgents(): Agent[] {

  return [...registry.values()];

}
