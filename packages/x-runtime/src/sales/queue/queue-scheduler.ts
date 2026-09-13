export class QueueScheduler {

  shouldRun(
    scheduledAt: string,
    now = new Date(),
  ) {

    return (
      new Date(scheduledAt).getTime() <=
      now.getTime()
    );

  }

}
