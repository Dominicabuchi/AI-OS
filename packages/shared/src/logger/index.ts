export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

function write(
  level: LogLevel,
  message: string,
  meta?: unknown
) {
  const time = new Date().toISOString();

  const payload = {
    time,
    level,
    message,
    meta
  };

  console.log(JSON.stringify(payload));
}

export const logger: Logger = {
  debug: (m, meta) => write("debug", m, meta),
  info: (m, meta) => write("info", m, meta),
  warn: (m, meta) => write("warn", m, meta),
  error: (m, meta) => write("error", m, meta)
};
