import fs from "fs";
import path from "path";
import {
  ModelOutcome,
  ModelPerformanceRecord,
} from "./performance-types";

const STORE_VERSION = 1;

function storePath(): string {
  return path.resolve(
    process.env.AI_OS_MODEL_PERFORMANCE_STORE ??
      ".ai-os/model-performance.json",
  );
}

function ensureStore(): void {
  const file = storePath();

  fs.mkdirSync(
    path.dirname(file),
    { recursive: true },
  );

  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          version: STORE_VERSION,
          records: [],
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

function readRecords(): ModelPerformanceRecord[] {
  ensureStore();

  try {
    const parsed = JSON.parse(
      fs.readFileSync(
        storePath(),
        "utf8",
      ),
    );

    if (
      parsed?.version === STORE_VERSION &&
      Array.isArray(parsed.records)
    ) {
      return parsed.records;
    }
  } catch {
    // Rebuild invalid/corrupt store.
  }

  return [];
}

function writeRecords(
  records: ModelPerformanceRecord[],
): void {
  ensureStore();

  const file = storePath();
  const temporary = `${file}.tmp`;

  fs.writeFileSync(
    temporary,
    JSON.stringify(
      {
        version: STORE_VERSION,
        records,
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.renameSync(
    temporary,
    file,
  );
}

function ewma(
  previous: number,
  value: number,
  alpha = 0.2,
): number {
  if (!Number.isFinite(previous)) {
    return value;
  }

  return (
    previous * (1 - alpha) +
    value * alpha
  );
}

export function getPerformance(
  model: string,
  taskFamily: ModelOutcome["taskFamily"],
): ModelPerformanceRecord | undefined {
  return readRecords().find(
    (record) =>
      record.model === model &&
      record.taskFamily === taskFamily,
  );
}

export function getAllPerformance():
  ModelPerformanceRecord[] {
  return readRecords();
}

export function recordOutcome(
  outcome: ModelOutcome,
): ModelPerformanceRecord {
  const records = readRecords();

  const index = records.findIndex(
    (record) =>
      record.model === outcome.model &&
      record.taskFamily ===
        outcome.taskFamily,
  );

  const now =
    new Date().toISOString();

  const quality =
    Math.max(
      0,
      Math.min(
        100,
        outcome.quality ?? (
          outcome.success
            ? 100
            : 0
        ),
      ),
    );

  const success =
    outcome.success ? 1 : 0;

  const toolSuccess =
    outcome.toolSuccess == null
      ? success
      : Math.max(
          0,
          Math.min(
            1,
            outcome.toolSuccess,
          ),
        );

  let record =
    index >= 0
      ? records[index]
      : undefined;

  if (!record) {
    record = {
      version: 1,
      model: outcome.model,
      family: outcome.family,
      taskFamily:
        outcome.taskFamily,

      attempts: 1,
      successes: outcome.success ? 1 : 0,
      failures: outcome.success ? 0 : 1,

      qualityEwma: quality,
      successEwma: success,
      toolSuccessEwma:
        toolSuccess,

      latencyEwmaMs:
        outcome.latencyMs ?? 0,

      costEwmaUsd:
        outcome.costUsd ?? 0,

      lastScore: quality,
      lastUpdated: now,
    };

    records.push(record);
  } else {
    record.family =
      outcome.family;

    record.attempts += 1;

    if (outcome.success) {
      record.successes += 1;
    } else {
      record.failures += 1;
    }

    record.qualityEwma =
      ewma(
        record.qualityEwma,
        quality,
      );

    record.successEwma =
      ewma(
        record.successEwma,
        success,
      );

    record.toolSuccessEwma =
      ewma(
        record.toolSuccessEwma,
        toolSuccess,
      );

    if (
      outcome.latencyMs != null
    ) {
      record.latencyEwmaMs =
        record.latencyEwmaMs === 0
          ? outcome.latencyMs
          : ewma(
              record.latencyEwmaMs,
              outcome.latencyMs,
            );
    }

    if (
      outcome.costUsd != null
    ) {
      record.costEwmaUsd =
        record.costEwmaUsd === 0
          ? outcome.costUsd
          : ewma(
              record.costEwmaUsd,
              outcome.costUsd,
            );
    }

    record.lastScore =
      quality;

    record.lastUpdated =
      now;
  }

  if (index >= 0) {
    records[index] = record;
  }

  writeRecords(records);

  return record;
}
