import { QueueStatus } from "./queue-item";
import { QueueScheduler } from "./queue-scheduler";
import { QueueStore } from "./queue-store";
import { QueueWorker } from "./queue-worker";
import { RateLimiter } from "../rate-limit";

export class QueueRunner {

  constructor(
    private readonly queue: QueueStore,
    private readonly scheduler: QueueScheduler,
    private readonly worker: QueueWorker,
    private readonly limiter: RateLimiter,
  ) {}

  async run(): Promise<void> {

    while (this.queue.size()) {

      const item = this.queue.peek();

      if (!item) {
        return;
      }

      if (!this.scheduler.shouldRun(item.scheduledAt)) {
        return;
      }

      if (!this.limiter.canSend()) {
        return;
      }

      this.queue.next();

      await this.worker.execute(item);

      if (item.status === QueueStatus.Sent) {
        this.limiter.recordSend();
      }

      if (item.status === QueueStatus.Retrying) {
        this.queue.add(item);
      }

    }

  }

}
