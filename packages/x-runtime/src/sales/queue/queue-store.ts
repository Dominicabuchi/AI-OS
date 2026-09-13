import { QueueItem } from "./queue-item";

export class QueueStore {

  private readonly queue: QueueItem[] = [];

  add(item: QueueItem) {
    this.queue.push(item);
    this.queue.sort(
      (a, b) => b.priority - a.priority
    );
  }

  next() {
    return this.queue.shift();
  }

  peek() {
    return this.queue[0];
  }

  all() {
    return [...this.queue];
  }

  size() {
    return this.queue.length;
  }

}
