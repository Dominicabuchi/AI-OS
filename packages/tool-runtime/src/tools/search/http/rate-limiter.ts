export class RateLimiter {

  constructor(
    private readonly intervalMs = 100
  ) {}

  private lastExecution = 0;

  async wait(): Promise<void> {

    const now = Date.now();

    const elapsed =
      now - this.lastExecution;

    if (elapsed < this.intervalMs) {

      await new Promise(resolve =>
        setTimeout(
          resolve,
          this.intervalMs - elapsed
        )
      );

    }

    this.lastExecution = Date.now();

  }

}
