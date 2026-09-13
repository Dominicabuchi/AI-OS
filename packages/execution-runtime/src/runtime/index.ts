import { getAgent } from "@ai-os/agent-runtime";
import { emitRuntimeEvent } from "@ai-os/shared";
import { buildIntelligence } from "@ai-os/intelligence-runtime";
import {
  generate,
  recordOutcome,
} from "@ai-os/model-runtime";

import { getToolForAction, getTools } from "@ai-os/tool-runtime";

import {
  ExecutionRequest,
  ExecutionResult,
} from "../types/execution";

function parseExecutableJson(text: string): any {
  const source = text.trim();

  const isExecutableObject = (
    value: unknown,
  ): value is {
    actions: unknown[];
  } => {
    return Boolean(
      value &&
      typeof value === "object" &&
      Array.isArray(
        (value as Record<string, unknown>)
          .actions,
      ),
    );
  };

  const tryParse = (
    candidate: string,
  ): any | undefined => {
    const value = candidate.trim();

    if (!value) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(value);

      if (isExecutableObject(parsed)) {
        return parsed;
      }
    } catch {
      // Continue to other extraction strategies.
    }

    return undefined;
  };

  /*
   * 1. Exact raw JSON.
   */
  const direct = tryParse(source);

  if (direct) {
    return direct;
  }

  /*
   * 2. Any Markdown JSON/code fence anywhere in the response.
   *
   * Models commonly return:
   *   prose
   *   ```json
   *   {"actions":[...]}
   *   ```
   */
  const fencePattern =
    /```(?:json)?\s*([\s\S]*?)```/gi;

  let fenceMatch:
    RegExpExecArray | null;

  while (
    (fenceMatch =
      fencePattern.exec(source))
  ) {
    const parsed =
      tryParse(fenceMatch[1]);

    if (parsed) {
      return parsed;
    }
  }

  /*
   * 3. Balanced JSON-object extraction.
   *
   * Handles prose before/after a valid executable object.
   * String contents and escaped quotes are respected so braces
   * inside command strings do not corrupt balancing.
   */
  for (
    let objectStart = 0;
    objectStart < source.length;
    objectStart++
  ) {
    if (source[objectStart] !== "{") {
      continue;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (
      let i = objectStart;
      i < source.length;
      i++
    ) {
      const char = source[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === '"') {
          inString = false;
        }

        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        depth++;
        continue;
      }

      if (char === "}") {
        depth--;

        if (depth === 0) {
          const parsed =
            tryParse(
              source.slice(
                objectStart,
                i + 1,
              ),
            );

          if (parsed) {
            return parsed;
          }

          break;
        }
      }
    }
  }

  throw new Error(
    'Model response did not contain a valid executable JSON object with an "actions" array.',
  );
}

export async function execute(
  request: ExecutionRequest,
): Promise<ExecutionResult> {
  const agent = getAgent(request.agentId);

  if (!agent) {
    throw new Error(
      `Execution runtime could not resolve agent "${request.agentId}" from the registered agent registry.`
    );
  }

  console.log("[EXEC TRACE] request =", JSON.stringify(request, null, 2));
  console.log("[EXEC TRACE] agent =", agent ? {
    id: agent.id,
    name: agent.name,
    tools: agent.tools,
  } : agent);
  console.log("[EXEC TRACE] mission =", request.mission);
  console.log("[EXEC TRACE] mission.id =", request.mission?.id);
  console.log("[EXEC TRACE] mission.goal =", request.mission?.goal);
  console.log("[EXEC TRACE] agent.buildPrompt =", typeof agent?.buildPrompt);
  console.log("[EXEC TRACE] agent object keys =", agent ? Object.keys(agent) : null);

  const missionStartedAt = Date.now();

  emitRuntimeEvent("mission.started", {
    missionId: request.mission.id,
    agentId: agent.id,
    payload: {
      goal: request.mission.goal,
    },
  });

  emitRuntimeEvent("agent.started", {
    missionId: request.mission.id,
    agentId: agent.id,
  });

  const maxIterations =
    request.mission.maxIterations ?? 25;

  let iteration = 0;
  let actionsExecuted = 0;
  let missionSucceeded = false;
  let output = "";

  const context: string[] = [];

  while (iteration < maxIterations) {
    iteration++;

    emitRuntimeEvent("iteration.started", {
      missionId: request.mission.id,
      agentId: agent.id,
      iteration,
    });

    const intelligence =
      await buildIntelligence({
        missionId: request.mission.id,
        agentId: agent.id,
        goal: request.mission.goal,
      });

    const prompt = [
      await agent.buildPrompt(request.mission),

      "",

      "INTELLIGENCE",
      JSON.stringify(
        intelligence,
        null,
        2,
      ),

      "",

      "WORKING MEMORY",
      ...context,

      "",

      "RUNTIME TOOL CONTRACT",
      "These are the executable AI-OS tools currently registered in the runtime.",
      ...getTools().flatMap((tool: any) => {
        if (tool.id === "terminal") {
          return [
            "TOOL: terminal | DESCRIPTION: Execute terminal commands",
            "EXECUTABLE ACTION: terminal.exec",
            "PAYLOAD SCHEMA: { \"command\": string }",
            "REQUIRED PAYLOAD FIELD: command",
            "EXAMPLE: {\"type\":\"terminal.exec\",\"payload\":{\"command\":\"printf HELLO\"}}",
          ];
        }

        if (tool.id === "files") {
          return [
            `TOOL: files | DESCRIPTION: ${tool.description}`,
            "EXECUTABLE ACTION: files.read",
            'PAYLOAD SCHEMA: { "path": string }',
            "REQUIRED PAYLOAD FIELD: path",
            "EXECUTABLE ACTION: files.write",
            'PAYLOAD SCHEMA: { "path": string, "content": string }',
            "REQUIRED PAYLOAD FIELDS: path, content",
          ];
        }

        if (tool.id === "browser") {
          return [
            `TOOL: browser | DESCRIPTION: ${tool.description}`,
            "EXECUTABLE ACTION: browser.goto",
            "PAYLOAD SCHEMA: { \"url\": string, \"profile\"?: string }",
            "EXECUTABLE ACTION: browser.extract",
            "PAYLOAD SCHEMA: { \"selector\": string, \"profile\"?: string }",
            "EXECUTABLE ACTION: browser.click",
            "PAYLOAD SCHEMA: { \"selector\": string, \"profile\"?: string }",
            "EXECUTABLE ACTION: browser.type",
            "PAYLOAD SCHEMA: { \"selector\": string, \"text\": string, \"profile\"?: string }",
          ];
        }

        if (tool.id === "search") {
          return [
            `TOOL: search | DESCRIPTION: ${tool.description}`,
            "EXECUTABLE ACTION: search.web",
            "PAYLOAD SCHEMA: { \"query\": string }",
            "REQUIRED PAYLOAD FIELD: query",
          ];
        }

        if (tool.id === "memory") {
          return [
            `TOOL: memory | DESCRIPTION: ${tool.description}`,
            "EXECUTABLE ACTION: memory.save",
            'PAYLOAD SCHEMA: { "missionId"?: string, "agentId"?: string, "scope"?: "shared"|"private", "type"?: "working"|"episodic"|"semantic"|"long_term"|"entity"|"relationship", "content": string, "metadata"?: object }',
            "EXECUTABLE ACTION: memory.retrieve",
            'PAYLOAD SCHEMA: { "query": string }',
            "EXECUTABLE ACTION: memory.retrieve.shared",
            'PAYLOAD SCHEMA: { "missionId": string }',
            "EXECUTABLE ACTION: memory.retrieve.mission",
            'PAYLOAD SCHEMA: { "missionId": string }',
            "EXECUTABLE ACTION: memory.retrieve.agent",
            'PAYLOAD SCHEMA: { "agentId": string }',
            "EXECUTABLE ACTION: memory.search",
            'PAYLOAD SCHEMA: { "query": string }',
            "EXECUTABLE ACTION: memory.search.shared",
            'PAYLOAD SCHEMA: { "missionId": string, "query": string }',
            "EXECUTABLE ACTION: memory.search.mission",
            'PAYLOAD SCHEMA: { "missionId": string, "query": string }',
            "EXECUTABLE ACTION: memory.context",
            'PAYLOAD SCHEMA: { "missionId": string, "agentId": string, "query"?: string }',
          ].join("\n");
        }

        if (tool.id === "http") {
          return [
            `TOOL: http | DESCRIPTION: ${tool.description}`,
            "EXECUTABLE ACTION: http.request",
            "PAYLOAD SCHEMA: { \"url\": string, \"method\"?: string, \"headers\"?: object, \"body\"?: unknown }",
            "REQUIRED PAYLOAD FIELD: url",
          ];
        }

        return [
          `TOOL: ${tool.id} | DESCRIPTION: ${tool.description}`,
        ];
      }),
      "",
      "IMPORTANT ACTION RULES",
      "Use the exact executable action name required by the tool.",
      "For terminal execution the executable action is terminal.exec.",
      "terminal.exec REQUIRES payload.command as a non-empty string.",
      "NEVER emit terminal.exec without payload.command.",
      "NEVER emit an undefined, null, or empty command.",
      "Do not claim terminal is unavailable.",
      "Do not return finish until the required mission action has actually executed.",
      "",
      "EXECUTION CONTRACT",
      "You are inside the AI-OS execution runtime.",
      "OpenClaw is the model bridge only. Its agent workspace is NOT the execution filesystem root.",
      "The RUNTIME TOOL CONTRACT above is authoritative for AI-OS executable tools.",
      "Do NOT use OpenClaw tool discovery, openclaw.tools.search, describe(), or OpenClaw's own tool catalog to determine whether an AI-OS runtime tool exists.",
      "If an AI-OS executable action is listed in the RUNTIME TOOL CONTRACT, emit that action directly in the actions array.",
      "For memory missions requiring persistence verification, execute memory.save first, observe its result, then execute the requested memory retrieval/search actions and verify their actual tool results before finishing.",
      "AI-OS runtime tools execute in the AI-OS process environment, independently of the OpenClaw model workspace.",
      "For native AI-OS filesystem actions, preserve mission-supplied relative paths exactly unless a tool result proves a different path is required.",
      "Do NOT rewrite relative repository paths into an OpenClaw workspace path.",
      "For example, if the mission asks files.read to read package.json, use payload.path exactly as package.json unless runtime evidence requires otherwise.",
      "For terminal.exec, relative paths and commands execute from the AI-OS runtime process working directory unless the command explicitly changes directory.",
      "Never infer a filesystem path from the OpenClaw agent workspace.",
      "Your response MUST be executable JSON.",
      'The root object MUST contain an "actions" array.',
      "Every action must have a valid executable action type.",
      "Use available capabilities to actually perform the mission.",
      "Do NOT claim a registered runtime tool is unavailable.",
      "Do NOT return a finish action before performing the required work.",
      "Do NOT describe an action in prose.",
      "Do NOT return Markdown.",
      "Do NOT prefix JSON with the word json.",
      "If the mission requires terminal execution, execute terminal.exec FIRST and observe its result before finishing.",
      "If a tool execution fails, do not finish the mission; use the error/result to correct the action and retry.",
      "If the mission is complete after executing the required work, return a finish action.",
      "Executable terminal example:",
      JSON.stringify(
        {
          actions: [
            {
              type: "terminal.exec",
              payload: {
                command: "printf PHASE_G_STEP_ONE_OK",
              },
            },
          ],
        },
        null,
        2,
      ),
      "Example:",


      JSON.stringify(
        {
          actions: [
            {
              type: "finish",
              payload: {
                result: "completed",
              },
            },
          ],
        },
        null,
        2,
      ),
    ].join("\n");

    const modelStartedAt = Date.now();

    if (process.env.AI_OS_EXEC_TRACE === "1") {
      console.log(
        "[AI-OS TRACE][iteration.start]",
        JSON.stringify({
          missionId: request.mission.id,
          agentId: agent.id,
          iteration,
          contextEntries: context.length,
          context,
        }),
      );
    }


    emitRuntimeEvent("model.started", {
      missionId: request.mission.id,
      agentId: agent.id,
      iteration,
    });

    const response =
      await generate({
        agent: agent.id,
        task: request.mission.goal,
        prompt,
        system: agent.systemPrompt,
      });

    const modelLatencyMs =
      Date.now() - modelStartedAt;

    emitRuntimeEvent("model.completed", {
      missionId: request.mission.id,
      agentId: agent.id,
      iteration,
      durationMs: modelLatencyMs,
      success: true,
      payload: {
        model: response.model,
        taskFamily: response.taskFamily,
      },
    });

    output = response.text;

    if (process.env.AI_OS_EXEC_TRACE === "1") {
      console.log(
        "[AI-OS TRACE][model.response.meta]",
        JSON.stringify({
          missionId: request.mission.id,
          agentId: agent.id,
          iteration,
          model: response.model,
          taskFamily: response.taskFamily,
          durationMs: modelLatencyMs,
        }),
      );
      console.log("[AI-OS TRACE][model.response.text]");
      console.log(response.text);
      console.log("[AI-OS TRACE][model.response.text.end]");
    }


    let json: any;

    try {
      json = parseExecutableJson(
        response.text,
      );

      if (process.env.AI_OS_EXEC_TRACE === "1") {
        console.log("[AI-OS TRACE][model.parsed-actions]");
        console.log(JSON.stringify(json, null, 2));
        console.log("[AI-OS TRACE][model.parsed-actions.end]");
      }
    } catch {
      context.push(
        JSON.stringify({
          type: "execution-error",
          error:
            "The previous model response was not valid executable JSON.",
          response:
            response.text.slice(0, 4000),
          instruction:
            "Retry the mission. Return ONLY executable JSON with an actions array. Do not return prose.",
        }),
      );

      continue;
    }

    let finished = false;
    let iterationToolSuccess = true;
    let iterationToolCount = 0;

    for (const action of json.actions ?? []) {

      /*
       * Control/result messages produced by the agent harness
       * are not AI-OS tool capabilities.
       *
       * Never route these through getToolForAction().
       */
      if (
        action.type === "finish" ||
        action.type === "tool_result" ||
        action.type === "tool-result"
      ) {
        if (
          action.type === "finish"
        ) {
          finished = true;
        }

        if (process.env.AI_OS_EXEC_TRACE === "1") {
          console.log(
            "[AI-OS TRACE][control.action]",
            JSON.stringify({
              missionId: request.mission.id,
              agentId: agent.id,
              iteration,
              action: action.type,
              payload: action.payload ?? action.result ?? null,
              finished,
            }),
          );
        }


        context.push(
          JSON.stringify({
            action: action.type,
            result:
              action.payload ??
              action.result ??
              null,
          }),
        );

        continue;
      }

      const tool =
        getToolForAction(action.type);

      if (process.env.AI_OS_EXEC_TRACE === "1") {
        console.log(
          "[AI-OS TRACE][tool.dispatch]",
          JSON.stringify({
            missionId: request.mission.id,
            agentId: agent.id,
            iteration,
            action: action.type,
            toolId: tool.id,
            payload: action.payload ?? {},
          }),
        );
      }


      iterationToolCount++;

      const toolStartedAt = Date.now();

      emitRuntimeEvent("tool.started", {
        missionId: request.mission.id,
        agentId: agent.id,
        iteration,
        toolId: tool.id,
        action: action.type,
      });

      try {
        const result =
          await tool.execute(
            action.type,
            action.payload ?? {},
          );

        const toolDurationMs =
          Date.now() - toolStartedAt;

        if (process.env.AI_OS_EXEC_TRACE === "1") {
          console.log(
            "[AI-OS TRACE][tool.result]",
            JSON.stringify({
              missionId: request.mission.id,
              agentId: agent.id,
              iteration,
              action: action.type,
              toolId: tool.id,
              durationMs: toolDurationMs,
              result,
            }),
          );
        }


        emitRuntimeEvent("tool.completed", {
          missionId: request.mission.id,
          agentId: agent.id,
          iteration,
          toolId: tool.id,
          action: action.type,
          durationMs: toolDurationMs,
          success: true,
        });

        context.push(
          JSON.stringify({
            action: action.type,
            result,
          }),
        );

        if (process.env.AI_OS_EXEC_TRACE === "1") {
          console.log(
            "[AI-OS TRACE][context.after-tool-success]",
            JSON.stringify(context),
          );
        }

      } catch (error) {
        iterationToolSuccess = false;

        if (process.env.AI_OS_EXEC_TRACE === "1") {
          console.error(
            "[AI-OS TRACE][tool.error]",
            JSON.stringify({
              missionId: request.mission.id,
              agentId: agent.id,
              iteration,
              action: action.type,
              toolId: tool.id,
              payload: action.payload ?? {},
              error:
                error instanceof Error
                  ? error.stack ?? error.message
                  : String(error),
            }),
          );
        }


        emitRuntimeEvent("tool.failed", {
          missionId: request.mission.id,
          agentId: agent.id,
          iteration,
          toolId: tool.id,
          action: action.type,
          durationMs: Date.now() - toolStartedAt,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });

        context.push(
          JSON.stringify({
            action: action.type,
            success: false,
            error:
              error instanceof Error
                ? error.message
                : String(error),
            instruction:
              "The tool action failed. Inspect this actual failure, correct the cause when appropriate, and continue the mission. Do not fabricate success.",
          }),
        );

        if (process.env.AI_OS_EXEC_TRACE === "1") {
          console.log(
            "[AI-OS TRACE][context.after-tool-failure]",
            JSON.stringify(context),
          );
        }


        /*
         * A failed tool action is still an observed execution attempt.
         * Do not abort the entire mission: the agent needs the real
         * failure result in working memory so it can diagnose/recover
         * on the next iteration.
         */
        actionsExecuted++;
        break;
      }

      actionsExecuted++;
    }

    const missionQuality =
      finished
        ? 100
        : json.actions?.length
          ? 75
          : 25;

    const executionSuccess =
      finished && iterationToolSuccess;
    if (process.env.AI_OS_EXEC_TRACE === "1") {
      console.log(
        "[AI-OS TRACE][iteration.end]",
        JSON.stringify({
          missionId: request.mission.id,
          agentId: agent.id,
          iteration,
          iterationToolCount,
          iterationToolSuccess,
          finished,
          totalActionsExecuted: actionsExecuted,
          contextEntries: context.length,
        }),
      );
    }


    emitRuntimeEvent("iteration.completed", {
      missionId: request.mission.id,
      agentId: agent.id,
      iteration,
      success: iterationToolSuccess,
      payload: {
        actionsExecuted: iterationToolCount,
        finished,
      },
    });

    recordOutcome({
      model: response.model,
      family: response.selection.family,
      taskFamily: response.taskFamily,
      success: executionSuccess,
      quality: missionQuality,
      toolSuccess:
        iterationToolCount === 0
          ? 1
          : iterationToolSuccess
            ? 1
            : 0,
      latencyMs: modelLatencyMs,
    });

    if (finished) {
      missionSucceeded = iterationToolSuccess;
      break;
    }
  }

  const allowFinishWithoutTools =
    (request.mission as any)?.allowFinishWithoutTools === true;

  const success =
    missionSucceeded &&
    (
      actionsExecuted > 0 ||
      allowFinishWithoutTools
    );

  if (success) {
    emitRuntimeEvent("mission.completed", {
      missionId: request.mission.id,
      agentId: agent.id,
      durationMs: missionStartedAt
        ? Date.now() - missionStartedAt
        : undefined,
      success: true,
      payload: {
        actionsExecuted,
        iterations: iteration,
      },
    });

    emitRuntimeEvent("agent.completed", {
      missionId: request.mission.id,
      agentId: agent.id,
      success: true,
      payload: {
        actionsExecuted,
        iterations: iteration,
      },
    });
  }

  return {
    success,
    output,
    actionsExecuted,
  };
}
