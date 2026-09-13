export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {

  const retries = options.retries ?? 3;
  const delay = options.delayMs ?? 500;
  const multiplier = options.backoffMultiplier ?? 2;

  let attempt = 0;
  let wait = delay;

  while (true) {

    try {
      return await operation();
    } catch (error) {

      attempt++;

      if (attempt > retries)
        throw error;

      await new Promise(resolve =>
        setTimeout(resolve, wait)
      );

      wait *= multiplier;

    }

  }

}
