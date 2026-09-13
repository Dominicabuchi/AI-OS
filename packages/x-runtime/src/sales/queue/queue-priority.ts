import { LeadStage } from "../types";
import { QueuePriority } from "./queue-item";

export class QueuePriorityEngine {

  resolve(
    stage: LeadStage,
  ): QueuePriority {

    switch (stage) {

      case LeadStage.Interested:
        return QueuePriority.Critical;

      case LeadStage.Qualified:
        return QueuePriority.High;

      case LeadStage.Replied:
        return QueuePriority.High;

      case LeadStage.Contacted:
        return QueuePriority.Normal;

      default:
        return QueuePriority.Low;

    }

  }

}
