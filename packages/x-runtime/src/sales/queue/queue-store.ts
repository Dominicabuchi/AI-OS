import fs from "node:fs";
import path from "node:path";

import { QueueItem } from "./queue-item";

export class QueueStore {

  private readonly file =
    process.env.AI_OS_SALES_QUEUE_STORE ??
    path.join(
      path.resolve(
        process.env.AI_OS_STATE_DIR ?? ".ai-os"
      ),
      "sales",
      "queue.json"
    );

  constructor() {

    this.ensure();

  }

  private ensure(): void {

    fs.mkdirSync(
      path.dirname(this.file),
      {
        recursive: true
      }
    );

    if (!fs.existsSync(this.file)) {

      fs.writeFileSync(
        this.file,
        "[]\n",
        "utf8"
      );

    }

  }

  private load(): QueueItem[] {

    this.ensure();

    try {

      const parsed =
        JSON.parse(
          fs.readFileSync(
            this.file,
            "utf8"
          )
        );

      return Array.isArray(parsed)
        ? parsed as QueueItem[]
        : [];

    } catch {

      return [];

    }

  }

  private persist(
    queue: QueueItem[]
  ): void {

    this.ensure();

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        queue,
        null,
        2
      ) + "\n",
      "utf8"
    );

  }

  add(
    item: QueueItem
  ) {

    const queue =
      this.load();

    const existing =
      queue.findIndex(
        candidate =>
          candidate.id === item.id
      );

    if (existing >= 0) {

      queue[existing] =
        item;

    } else {

      queue.push(item);

    }

    queue.sort(
      (a, b) =>
        b.priority -
        a.priority
    );

    this.persist(queue);

  }

  next() {

    const queue =
      this.load();

    const item =
      queue.shift();

    this.persist(queue);

    return item;

  }

  peek() {

    return this.load()[0];

  }

  all() {

    return this.load();

  }

  size() {

    return this.load().length;

  }

}
