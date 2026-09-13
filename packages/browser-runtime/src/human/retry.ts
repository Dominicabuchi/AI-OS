import { RetryOptions } from "./types";
import { DEFAULT_HUMAN_CONFIG } from "./config";

export class RetryEngine {
  async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const attempts =
      options.attempts ??
      DEFAULT_HUMAN_CONFIG.defaultRetryAttempts;

    const delay =
      options.delay ??
      DEFAULT_HUMAN_CONFIG.defaultRetryDelay;

    const backoff = options.backoff ?? 2;

    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (i === attempts - 1) {
          break;
        }

        const base =
          delay * Math.pow(
            backoff,
            i
          );

        const jitter =
          Math.floor(
            base *
            (
              0.20 +
              Math.random() *
              0.25
            )
          );

        await this.sleep(
          base + jitter
        );
      }
    }

    throw lastError;
  }

  async executeUntil<T>(
    operation: () => Promise<T>,
    predicate: (value: T) => boolean,
    options: RetryOptions = {}
  ): Promise<T> {
    return this.execute(async () => {
      const result = await operation();

      if (!predicate(result)) {
        throw new Error("Retry condition not satisfied.");
      }

      return result;
    }, options);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
