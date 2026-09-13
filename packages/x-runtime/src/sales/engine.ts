import { HumanBrowser } from "@ai-os/browser-runtime";

import { XMessaging } from "../messaging/x-messaging";
import { XMessagingAdapter } from "./adapters/x-adapter";

import { SalesContext } from "./context";
import { FollowupEngine } from "./followup";
import { LeadScorer } from "./lead-score";
import { ReplyDetector } from "./reply-detector";
import { LeadQualifier } from "./lead-qualifier";
import { ConversationIntelligence } from "./conversation-intelligence";

import { SequenceRunner } from "./sequence-runner";
import { CampaignRunner } from "./campaign-runner";

import { QueueStore } from "./queue/queue-store";
import { QueuePriorityEngine } from "./queue/queue-priority";
import { QueueScheduler } from "./queue/queue-scheduler";
import { QueueWorker } from "./queue/queue-worker";
import { QueueRunner } from "./queue/queue-runner";
import { RateLimiter } from "./rate-limit";

export class SalesEngine {

  readonly context =
    new SalesContext();

  readonly followups =
    new FollowupEngine();

  readonly scoring =
    new LeadScorer();

  readonly replies =
    new ReplyDetector();

  readonly qualifier =
    new LeadQualifier();

  readonly intelligence =
    new ConversationIntelligence();

  readonly messaging: XMessagingAdapter;

  readonly queue =
    new QueueStore();

  readonly priorities =
    new QueuePriorityEngine();

  readonly scheduler =
    new QueueScheduler();

  readonly limiter =
    new RateLimiter();

  readonly worker: QueueWorker;

  readonly runner: QueueRunner;

  readonly sequences: SequenceRunner;

  readonly campaigns: CampaignRunner;

  constructor(
    human: HumanBrowser,
  ) {

    this.messaging =
      new XMessagingAdapter(
        new XMessaging(human)
      );

    this.worker =
      new QueueWorker(
        this.messaging
      );

    this.runner =
      new QueueRunner(
        this.queue,
        this.scheduler,
        this.worker,
        this.limiter
      );

    this.sequences =
      new SequenceRunner(
        this.queue,
        this.priorities
      );

    this.campaigns =
      new CampaignRunner(
        this.sequences,
        this.runner
      );

  }

}
