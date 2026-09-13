export class RefreshScheduler {

  private timer?: NodeJS.Timeout;

  start(
    intervalMs: number,
    refresh: () => Promise<void>
  ): void {

    this.stop();

    this.timer = setInterval(() => {

      refresh().catch(console.error);

    }, intervalMs);

  }

  stop(): void {

    if (this.timer) {

      clearInterval(this.timer);

      this.timer = undefined;

    }

  }

}
