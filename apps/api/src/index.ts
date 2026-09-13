import Fastify from "fastify";

import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  appendFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";

import path from "node:path";

import {
  getAgents,
  getAgent,
} from "@ai-os/agent-runtime";

import {
  getRuntimeEvents,
  subscribeRuntimeEvents,
} from "@ai-os/shared";

import {
  getTools,
} from "@ai-os/tool-runtime";

import {
  execute,
} from "@ai-os/execution-runtime";



const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.register(websocket);

const startedAt = Date.now();

const dataDir =
  process.env.AI_OS_DATA_DIR ??
  path.resolve(
    process.cwd(),
    ".ai-os-data",
  );

mkdirSync(
  dataDir,
  {
    recursive: true,
  },
);

const jobsFile =
  path.join(
    dataDir,
    "jobs.json",
  );

const eventsFile =
  path.join(
    dataDir,
    "runtime-events.jsonl",
  );

type PersistentJob = {
  id: string;
  agentId: string;
  mission: unknown;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: unknown;
  error?: string;
};

function loadPersistedJobs(): PersistentJob[] {
  if (!existsSync(jobsFile)) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        readFileSync(
          jobsFile,
          "utf8",
        ),
      );

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    app.log.error(
      error,
      "Failed to load persisted jobs",
    );

    return [];
  }
}

function persistJobs(
  jobs: Map<string, PersistentJob>,
): void {
  const tempFile =
    `${jobsFile}.tmp`;

  writeFileSync(
    tempFile,
    JSON.stringify(
      [...jobs.values()],
      null,
      2,
    ),
    "utf8",
  );

  renameSync(
    tempFile,
    jobsFile,
  );
}

function appendPersistentEvent(
  event: unknown,
): void {
  try {
    appendFileSync(
      eventsFile,
      JSON.stringify(event) + "\n",
      "utf8",
    );
  } catch (error) {
    app.log.error(
      error,
      "Failed to persist runtime event",
    );
  }
}

function readPersistedEvents(
  limit: number,
): unknown[] {
  if (
    limit <= 0 ||
    !existsSync(eventsFile)
  ) {
    return [];
  }

  try {
    return readFileSync(
      eventsFile,
      "utf8",
    )
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(
        (event) =>
          event !== null,
      );
  } catch (error) {
    app.log.error(
      error,
      "Failed to read persisted runtime events",
    );

    return [];
  }
}

subscribeRuntimeEvents(
  appendPersistentEvent,
);

app.after(() => {
  app.get(
    "/events/live",
    { websocket: true },
    (socket) => {
      const unsubscribe =
        subscribeRuntimeEvents((event) => {
          try {
            socket.send(
              JSON.stringify(event),
            );
          } catch {
            unsubscribe();
          }
        });
  
      socket.on("close", () => {
        unsubscribe();
      });
  
      socket.send(
        JSON.stringify({
          type: "connection.ready",
          timestamp:
            new Date().toISOString(),
        }),
      );
    },
  );
  
  
});

const jobs =
  new Map<string, PersistentJob>(
    loadPersistedJobs().map(
      (job) => [
        job.id,
        job,
      ],
    ),
  );

/*
 * ------------------------------------------------------------
 * HEALTH
 * ------------------------------------------------------------
 */

/*
 * ------------------------------------------------------------
 * AGENTS
 * ------------------------------------------------------------
 */

app.get("/agents", async () => {
  return getAgents().map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    model: agent.model,
    tools: agent.tools,
    runtimeCapabilities:
      "runtimeCapabilities" in agent
        ? (agent as any).runtimeCapabilities
        : [],
    agentDependencies: agent.agentDependencies,
    composioActions: agent.composioActions,
  }));
});

app.get<{ Params: { id: string } }>(
  "/agents/:id",
  async (request, reply) => {
    try {
      const agent = getAgent(request.params.id);

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        tools: agent.tools,
        runtimeCapabilities:
      "runtimeCapabilities" in agent
        ? (agent as any).runtimeCapabilities
        : [],
        agentDependencies: agent.agentDependencies,
        composioActions: agent.composioActions,
      };
    } catch {
      return reply.code(404).send({
        error: "Agent not found",
      });
    }
  },
);

/*
 * ------------------------------------------------------------
 * TOOLS
 * ------------------------------------------------------------
 */

app.get("/tools", async () => {
  return getTools().map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
  }));
});

/*
 * ------------------------------------------------------------
 * EVENTS
 * ------------------------------------------------------------
 */

app.get<{ Querystring: { limit?: string } }>(
  "/events",
  async (request) => {
    const requested =
      Number(
        request.query.limit ?? 500,
      );

    const limit =
      Number.isFinite(requested)
        ? Math.max(
            0,
            Math.min(
              requested,
              5000,
            ),
          )
        : 500;

    const persisted =
      readPersistedEvents(limit);

    if (persisted.length > 0) {
      return persisted;
    }

    return getRuntimeEvents(limit);
  },
);

/*
 * ------------------------------------------------------------
 * JOBS
 * ------------------------------------------------------------
 */

app.get("/jobs", async () => {
  return [...jobs.values()];
});

/*
 * ------------------------------------------------------------
 * CREATE / RUN MISSION
 * ------------------------------------------------------------
 */

app.post<{
  Body: {
    agentId: string;
    mission: {
      id: string;
      goal: string;
      maxIterations?: number;
      [key: string]: unknown;
    };
  };
}>(
  "/missions",
  async (request, reply) => {
    const { agentId, mission } = request.body;

    const job = {
      id: `job-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      agentId,
      mission,
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    jobs.set(
      job.id,
      job,
    );

    persistJobs(jobs);

    void (async () => {
      const current = jobs.get(job.id);

      if (!current) {
        return;
      }

      current.status = "running";

      current.startedAt =
        new Date().toISOString();

      persistJobs(jobs);

      try {
        const result = await execute({
          agentId,
          mission: mission as any,
        });

        current.status = result.success
          ? "completed"
          : "failed";

        current.result = result;

        current.completedAt =
          new Date().toISOString();

        if (!result.success) {
          const record =
            result as unknown as Record<
              string,
              unknown
            >;

          const failure =
            record.error ??
            record.reason ??
            record.message;

          current.error =
            failure
              ? String(failure)
              : "Mission returned success=false. See result for execution details.";
        }

        persistJobs(jobs);

      } catch (error) {
        current.status = "failed";
        current.error =
          error instanceof Error
            ? (error.stack || error.message)
            : String(error);

        current.completedAt =
          new Date().toISOString();

        persistJobs(jobs);

      }

    })();

    return reply.code(202).send(job);
  },
);

/*
 * ------------------------------------------------------------
 * SINGLE JOB
 * ------------------------------------------------------------
 */

app.get<{ Params: { id: string } }>(
  "/jobs/:id",
  async (request, reply) => {
    const job = jobs.get(request.params.id);

    if (!job) {
      return reply.code(404).send({
        error: "Job not found",
      });
    }

    return job;
  },
);

/*
 * ------------------------------------------------------------
 * LIVE EVENTS
 * ------------------------------------------------------------
 */

/*
 * ------------------------------------------------------------
 * START
 * ------------------------------------------------------------
 */

const port = Number(
  process.env.AI_OS_API_PORT ?? 3001,
);

const host =
  process.env.AI_OS_API_HOST ?? "127.0.0.1";

app.listen({
  port,
  host,
}).then(() => {
  console.log(
    `[AI-OS API] listening on ${host}:${port}`,
  );
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
