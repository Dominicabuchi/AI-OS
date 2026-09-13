export interface RedditJob {

  id: string;

  account: string;

  action: string;

  payload: unknown;

}

export class RedditQueue {

  private jobs: RedditJob[] = [];

  add(job: RedditJob) {
    this.jobs.push(job);
  }

  next(): RedditJob | undefined {
    return this.jobs.shift();
  }

  size() {
    return this.jobs.length;
  }

}
