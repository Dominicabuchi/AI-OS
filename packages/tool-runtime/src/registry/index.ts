import { Tool } from "../types/tool";

import { BrowserTool } from "../tools/browser-tool";
import { MemoryTool } from "../tools/memory-tool";
import { TaskTool } from "../tools/task-tool";
import { TerminalTool } from "../tools/terminal-tool";
import { FilesTool } from "../tools/files-tool";
import { GitTool } from "../tools/git-tool";
import { HttpTool } from "../tools/http-tool";
import { createSearchTool } from "../tools/search/registry";
import { GitHubTool } from "../tools/github-tool";
import { CITool } from "../tools/ci-tool";
import { DockerTool } from "../tools/docker-tool";
import { XTool } from "../tools/x-tool";
import { LinkedInTool } from "../tools/linkedin-tool";
import { RedditTool } from "../tools/reddit-tool";
import { CommunicationTool } from "../tools/communication-tool";
import { ComposioTool } from "../tools/composio-tool";
import { GmailTool } from "../tools/gmail-tool";
import { OpenClawMcpTool } from "../tools/openclaw-mcp-tool";
import { OpenClawTool } from "../tools/openclaw-tool";
import { AgentCapabilityTool } from "../tools/agent-capability-tool";

const registry = new Map<string, Tool>();

[
  new BrowserTool(),
  new MemoryTool(),
  new TaskTool(),
  new TerminalTool(),
  new FilesTool(),
  new GitTool(),
  new HttpTool(),
  createSearchTool(),
  new GitHubTool(),
  new CITool(),
  new DockerTool(),
  new XTool(),
  new LinkedInTool(),
  new RedditTool(),
  new CommunicationTool(),
  new ComposioTool(),
  new GmailTool(),
  new OpenClawMcpTool(),
  new OpenClawTool(),
  new AgentCapabilityTool(),
].forEach(tool => registry.set(tool.id, tool));

export function registerTool(tool: Tool): void {
  registry.set(tool.id, tool);
}

export function getTool(id: string): Tool {
  const tool = registry.get(id);

  if (!tool) {
    throw new Error(`Unknown tool: ${id}`);
  }

  return tool;
}

export function getToolForAction(action: string): Tool {
  /*
   * Agents may emit the canonical tool id as the action
   * (for example "terminal") while the tool exposes
   * executable actions such as "terminal.exec".
   *
   * Resolve the canonical tool id first when the action
   * exactly matches a registered tool.
   */
  const directTool = registry.get(action);

  if (directTool) {
    return directTool;
  }

  /*
   * Agent capabilities are internal delegation capabilities.
   * They must resolve to AgentCapabilityTool before normal
   * tool/MCP routing.
   */
  const agentCapabilityActions = new Set([
    "research",
    "planning",
    "reasoning",
    "execution",
  ]);

  if (agentCapabilityActions.has(action)) {
    const agentCapabilityTool = registry.get("agent-capability");

    if (agentCapabilityTool) {
      return agentCapabilityTool;
    }
  }

  /*
   * OpenClaw MCP is a dynamic capability surface.
   *
   * MCP tools are discovered at runtime, so synchronous
   * action resolution must not depend on asynchronous
   * discovery having already happened.
   *
   * Canonical MCP action forms:
   *
   *   filesystem__read_file
   *   mcp.filesystem__read_file
   *   openclaw.mcp.filesystem__read_file
   */

  /*
   * Composio canonical tool slugs are uppercase identifiers.
   *
   * They must be allowed to reach ComposioTool before the
   * dynamic OpenClaw MCP routing below. Otherwise the broad
   * MCP "__" detection can steal actions that belong to
   * Composio.
   */
  const isCanonicalComposioAction =
    /^[A-Z][A-Z0-9_]+$/.test(action);

  if (
    !isCanonicalComposioAction &&
    (
      action.includes("__") ||
      action.startsWith("mcp.") ||
      action.startsWith("openclaw.mcp.")
    )
  ) {
    const mcpTool = registry.get("openclaw-mcp");

    if (mcpTool) {
      return mcpTool;
    }
  }

  for (const tool of registry.values()) {
    if (tool.canExecute(action)) {
      return tool;
    }
  }

  throw new Error(
    `No tool registered for action: ${action}`,
  );
}

export function getTools(): Tool[] {
  return [...registry.values()];
}
