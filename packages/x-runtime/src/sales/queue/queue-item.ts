export enum QueuePriority {
  Low = 1,
  Normal = 5,
  High = 10,
  Critical = 20
}

export enum QueueStatus {
  Pending = "pending",
  Running = "running",
  Sent = "sent",
  Retrying = "retrying",
  Failed = "failed"
}

export interface QueueItem {

  id: string;

  leadId: string;

  conversationId?: string;

  campaignId?: string;

  sequenceId?: string;

  message: string;

  priority: QueuePriority;

  status: QueueStatus;

  scheduledAt: string;

  startedAt?: string;

  completedAt?: string;

  attempts: number;

  maxAttempts: number;

  lastError?: string;

}
