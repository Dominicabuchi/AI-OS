import { Page } from "playwright";

import {
  Snapshot,
  ElementNode
} from "./types";

export class DOMSnapshot {

  constructor(
    private readonly page: Page
  ) {}

  async capture(): Promise<Snapshot> {

    const title = await this.page.title();

    const url = this.page.url();

    const elements =
      await this.page.evaluate(() => {

        const elements: ElementNode[] = [];
        const visited = new Set<Element>();

        function collect(element: Element | null): void {

          if (
            !element ||
            visited.has(element)
          ) {
            return;
          }

          visited.add(element);

          const rect =
            element.getBoundingClientRect();

          const style =
            getComputedStyle(element);

          const visible =
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden";

          const attributes: Record<string, string> = {};
          const aria: Record<string, string> = {};

          for (const attribute of Array.from(element.attributes ?? []) as Attr[]) {

            attributes[attribute.name] = attribute.value;

            if (attribute.name.startsWith("aria-")) {
              aria[attribute.name] = attribute.value;
            }

          }

          const id =
            "node-" + elements.length;

          element.setAttribute(
            "data-aios-id",
            id
          );

          elements.push({

            id,

            selector:
              `[data-aios-id="${id}"]`,

            tag:
              element.tagName?.toLowerCase(),

            role:
              element.getAttribute?.("role") ?? undefined,

            text:
              element.textContent?.trim() || undefined,

            ariaLabel:
              element.getAttribute?.("aria-label") ?? undefined,

            placeholder:
              element.getAttribute?.("placeholder") ?? undefined,

            title:
              element.getAttribute?.("title") ?? undefined,

            href:
              element.getAttribute?.("href") ?? undefined,

            dataTestId:
              element.getAttribute?.("data-testid") ?? undefined,

            elementId:
              element.getAttribute?.("id") ?? undefined,

            name:
              element.getAttribute?.("name") ?? undefined,

            type:
              element.getAttribute?.("type") ?? undefined,

            className:
              element.getAttribute?.("class") ?? undefined,

            aria,

            visible,

            enabled:
              !((element as HTMLInputElement).disabled ?? false),

            editable:
              element.hasAttribute?.("contenteditable") ||
              ["INPUT","TEXTAREA"].includes(
                element.tagName
              ),

            bounds: {

              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height

            },

            attributes

          });

          // Shadow DOM
          if (element.shadowRoot) {

            for (const child of Array.from(element.shadowRoot.children)) {
              collect(child);
            }

          }

          // Regular DOM
          for (const child of Array.from(element.children)) {
            collect(child);
          }

          // Slots
          if (element.tagName === "SLOT") {

            for (const node of (element as HTMLSlotElement).assignedElements()) {
              collect(node);
            }

          }

          // iframe traversal (same-origin only)
          if (element.tagName === "IFRAME") {

            try {

              const frame =
                (element as HTMLIFrameElement)
                  .contentDocument;

              if (frame?.documentElement) {
                collect(frame.documentElement);
              }

            } catch {

              // Cross-origin iframe.
              // Browser security prevents access.
              // Ignore and continue.

            }

          }

        }

        collect(document.documentElement);

        return elements;

      });

    return {

      url,

      title,

      elements: elements as ElementNode[]

    };

  }

}
