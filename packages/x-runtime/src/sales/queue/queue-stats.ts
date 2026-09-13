import { QueueStatus } from "./queue-item";
import { QueueStore } from "./queue-store";

export interface QueueStatistics {

  total: number;

  pending: number;

  running: number;

  retrying: number;

  sent: number;

  failed: number;

}

export class QueueStats {

  constructor(
    private readonly queue: QueueStore,
  ) {}

  get(): QueueStatistics {

    const items = this.queue.all();

    return {

      total: items.length,

      pending:
        items.filter(i =>
          i.status === QueueStatus.Pending
        ).length,

      running:
        items.filter(i =>
          i.status === QueueStatus.Running
        ).length,

      retrying:
        items.filter(i =>
          i.status === QueueStatus.Retrying
        ).length,

      sent:
        items.filter(i =>
          i.status === QueueStatus.Sent
        ).length,

      failed:
        items.filter(i =>
          i.status === QueueStatus.Failed
        ).length,

    };

  }

}
