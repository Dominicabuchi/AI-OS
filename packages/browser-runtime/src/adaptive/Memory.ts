import fs from "fs";
import path from "path";

import {
  LearnedSelector,
  MemoryStore,
  SelectorResult
} from "./types";

export class Memory {

  private readonly file =
    process.env.AI_OS_ADAPTIVE_MEMORY_FILE ??
    path.join(
      path.resolve(
        process.env.AI_OS_STATE_DIR ?? ".ai-os"
      ),
      "adaptive-memory.json"
    );

  private readonly cache =
    new Map<string, LearnedSelector>();

  constructor() {
    this.loadFromDisk();
  }

  private key(
    platform: string,
    page: string,
    action: string
  ): string {
    return `${platform}:${page}:${action}`;
  }

  has(
    platform: string,
    page: string,
    action: string
  ): boolean {
    return this.cache.has(
      this.key(platform, page, action)
    );
  }

  save(
    selector: LearnedSelector
  ): void {

    const key = this.key(
      selector.platform,
      selector.page,
      selector.action
    );

    const existing =
      this.cache.get(key);

    if (existing) {

      const merged = new Map<string, SelectorResult>();

      for (const s of existing.selectors) {
        merged.set(s.selector, s);
      }

      for (const s of selector.selectors) {

        const current =
          merged.get(s.selector);

        if (!current) {

          merged.set(
            s.selector,
            s
          );

          continue;

        }

        current.confidence =
          Math.max(
            current.confidence,
            s.confidence
          );

      }

      existing.description =
        selector.description;

      existing.confidence =
        Math.max(
          existing.confidence,
          selector.confidence
        );

      existing.lastVerified =
        new Date().toISOString();

      existing.selectors =
        Array.from(merged.values());

      this.cache.set(
        key,
        existing
      );

    } else {

      selector.lastVerified =
        new Date().toISOString();

      selector.successCount ??= 0;
      selector.failureCount ??= 0;

      this.cache.set(
        key,
        selector
      );

    }

    this.saveToDisk();
  }

  load(
    platform: string,
    page: string,
    action: string
  ): LearnedSelector | undefined {

    return this.cache.get(
      this.key(
        platform,
        page,
        action
      )
    );

  }

  best(
    platform: string,
    page: string,
    action: string
  ): SelectorResult | undefined {

    const learned =
      this.load(
        platform,
        page,
        action
      );

    if (!learned) {
      return;
    }

    return [...learned.selectors]
      .sort(
        (a, b) =>
          b.confidence - a.confidence
      )[0];

  }

  update(
    platform: string,
    page: string,
    action: string,
    selector: string,
    success: boolean
  ): void {

    const learned =
      this.load(
        platform,
        page,
        action
      );

    if (!learned) {
      return;
    }

    const record =
      learned.selectors.find(
        s => s.selector === selector
      );

    if (!record) {
      return;
    }

    if (success) {
      learned.successCount++;
      record.confidence += 0.05;
    } else {
      learned.failureCount++;
      record.confidence -= 0.10;
    }

    record.confidence = Math.max(
      0,
      Math.min(1, record.confidence)
    );

    learned.confidence =
      learned.selectors.reduce(
        (sum, s) =>
          sum + s.confidence,
        0
      ) / learned.selectors.length;

    learned.lastVerified =
      new Date().toISOString();

    this.save(learned);
  }

  remove(
    platform: string,
    page: string,
    action: string
  ): void {

    this.cache.delete(
      this.key(
        platform,
        page,
        action
      )
    );

    this.saveToDisk();

  }

  clear(): void {

    this.cache.clear();

    this.saveToDisk();

  }

  list(): LearnedSelector[] {

    return Array.from(
      this.cache.values()
    );

  }

  stats() {

    const selectors =
      this.list();

    return {

      entries:
        selectors.length,

      successes:
        selectors.reduce(
          (t, s) =>
            t + s.successCount,
          0
        ),

      failures:
        selectors.reduce(
          (t, s) =>
            t + s.failureCount,
          0
        )

    };

  }

  private loadFromDisk(): void {

    if (!fs.existsSync(this.file)) {
      return;
    }

    const store =
      JSON.parse(
        fs.readFileSync(
          this.file,
          "utf8"
        )
      ) as MemoryStore;

    for (const selector of store.selectors) {

      selector.successCount ??= 0;
      selector.failureCount ??= 0;

      this.cache.set(
        this.key(
          selector.platform,
          selector.page,
          selector.action
        ),
        selector
      );

    }

  }

  private saveToDisk(): void {

    const store: MemoryStore = {

      selectors:
        this.list()

    };

    fs.writeFileSync(
      this.file,
      JSON.stringify(
        store,
        null,
        2
      )
    );

  }

}
