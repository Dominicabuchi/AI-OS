import { MessagingAdapter } from "../adapters/messaging-adapter";
import { QueueItem, QueueStatus } from "./queue-item";

export class QueueWorker {

  constructor(
    private readonly messaging: MessagingAdapter,
  ) {}

  async execute(
    item: QueueItem,
  ): Promise<void> {

    item.status = QueueStatus.Running;
    item.startedAt = new Date().toISOString();

    try {

      if (!item.conversationId) {
        throw new Error("Missing conversation.");
      }

      await this.messaging.send(
        item.conversationId,
        item.message,
      );

      item.status = QueueStatus.Sent;
      item.completedAt = new Date().toISOString();

    } catch (error) {

      item.attempts++;

      item.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      if (item.attempts >= item.maxAttempts) {

        item.status = QueueStatus.Failed;

      } else {

        item.status = QueueStatus.Retrying;

        const retry =
          new Date(
            Date.now() +
            item.attempts * 60000
          );

        item.scheduledAt =
          retry.toISOString();

      }

    }

  }

}
