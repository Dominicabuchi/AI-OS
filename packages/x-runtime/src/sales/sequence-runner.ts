import { randomUUID } from "crypto";

import { Lead } from "./types";
import { Sequence } from "./sequence";

import { QueueStore } from "./queue/queue-store";
import { QueueStatus } from "./queue/queue-item";
import { QueuePriorityEngine } from "./queue/queue-priority";

export class SequenceRunner {

  constructor(
    private readonly queue: QueueStore,
    private readonly priorities: QueuePriorityEngine,
  ) {}

  async execute(
    lead: Lead,
    sequence: Sequence,
    completed: number,
  ): Promise<boolean> {

    const step =
      sequence.nextStep(
        lead,
        completed,
      );

    if (!step) {
      return false;
    }

    const now = new Date();

    const scheduled =
      new Date(
        now.getTime() +
        step.delayHours * 60 * 60 * 1000
      );

    this.queue.add({

      id: randomUUID(),

      leadId: lead.id,

      conversationId: lead.id,

      sequenceId: sequence.id,

      message: step.message,

      priority:
        this.priorities.resolve(
          lead.stage,
        ),

      status:
        QueueStatus.Pending,

      scheduledAt:
        scheduled.toISOString(),

      attempts: 0,

      maxAttempts: 3,

    });

    return true;

  }

}
