export class RedditScheduler {

  async start(): Promise<void> {
    console.log("[Scheduler] Started");
  }

  async stop(): Promise<void> {
    console.log("[Scheduler] Stopped");
  }

}
