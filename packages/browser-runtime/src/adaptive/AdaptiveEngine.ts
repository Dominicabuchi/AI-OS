import {
  Locator,
  Page
} from "playwright";

import * as fs from "fs";
import * as path from "path";
import Tesseract from "tesseract.js";


import { DOMSnapshot } from "./DOMSnapshot";
import { HumanInteraction } from "../human/human-interaction";
import { Strategy } from "./Strategy";
import { Memory } from "./Memory";

import {
  AdaptiveValidator,
  ValidationPrinter
} from "../validation";

import {
  LocatorValidator
} from "./locator";

import {
  MemoryResolver,
  LiveDOMResolver,
  RecoveryResolver,
  VisionResolver,
  OCRResolver,
  ResolverPipeline
} from "./resolvers";


import {
  SearchRequest,
  LearnedSelector,
  SelectorResult
} from "./types";

export class AdaptiveEngine {

  private readonly snapshot: DOMSnapshot;

  private readonly strategy: Strategy;

  private readonly memory: Memory;

  private readonly validator: AdaptiveValidator;

  private readonly locatorValidator: LocatorValidator;

  private readonly pipeline: ResolverPipeline;

  private lastResolutionSelector:
    string | null = null;

  private readonly human: HumanInteraction;

  constructor(
    private readonly page: Page
  ) {

    this.human =
      new HumanInteraction(page);

    this.snapshot =
      new DOMSnapshot(page);

    this.strategy =
      new Strategy();

    this.memory =
      new Memory();

    this.validator =
      new AdaptiveValidator();

    this.locatorValidator =
      new LocatorValidator();

    this.pipeline =
      new ResolverPipeline([

        new MemoryResolver(

          page,

          this.memory,

          this.locatorValidator

        ),

        new LiveDOMResolver(

          page,

          this.snapshot,

          this.strategy

        ),

        new RecoveryResolver(

          page

        ),

        new VisionResolver(

          page,

          this.snapshot,

          this.strategy

        ),

        new OCRResolver()

      ]);

  }

  private buildSelectors(
    match: any
  ): string[] {

    const selectors: string[] = [];

    //
    // Highest priority:
    // exact DOM selector captured
    // during snapshot.
    //

    if (match.selector) {

      selectors.push(
        match.selector
      );

    }

    if (match.dataTestId) {
      selectors.push(
        `[data-testid="${match.dataTestId}"]`
      );
    }

    if (match.elementId) {
      selectors.push(
        `#${match.elementId}`
      );
    }

    if (match.name) {
      selectors.push(
        `[name="${match.name}"]`
      );
    }

    if (match.ariaLabel) {
      selectors.push(
        `[aria-label="${match.ariaLabel}"]`
      );
    }

    if (match.placeholder) {
      selectors.push(
        `[placeholder="${match.placeholder}"]`
      );
    }

    if (match.role) {
      selectors.push(
        `[role="${match.role}"]`
      );
    }

    if (match.href) {
      selectors.push(
        `a[href="${match.href}"]`
      );
    }

    if (match.type) {
      selectors.push(
        `[type="${match.type}"]`
      );
    }

    if (match.tag) {
      selectors.push(
        match.tag
      );
    }

    return [...new Set(selectors)];

  }


  private async verifyCachedSelector(
    locator: Locator,
    learned: SelectorResult
  ): Promise<boolean> {

    if (await locator.count() === 0) {
      return false;
    }

    if (learned.text) {

      const text =
        (await locator.textContent()) ?? "";

      if (!text.includes(learned.text)) {
        return false;
      }

    }

    if (learned.ariaLabel) {

      const aria =
        await locator.getAttribute("aria-label");

      if (aria !== learned.ariaLabel) {
        return false;
      }

    }

    if (learned.placeholder) {

      const placeholder =
        await locator.getAttribute("placeholder");

      if (placeholder !== learned.placeholder) {
        return false;
      }

    }

    if (learned.role) {

      const role =
        await locator.getAttribute("role");

      if (role !== learned.role) {
        return false;
      }

    }

    if (learned.tag) {

      const tag =
        await locator.evaluate(
          element => element.tagName.toLowerCase()
        );

      if (tag !== learned.tag) {
        return false;
      }

    }

    return true;

  }

  private async resolve(
    request: SearchRequest
  ): Promise<Locator> {

    const pipelineResult =
      await this.pipeline.resolve(
        request
      );

    if (pipelineResult) {

      console.log("");
      console.log("========== PIPELINE ==========");
      console.log("Resolved by pipeline");
      console.log("==============================");

      return pipelineResult;

    }

    const learned =
      this.memory.best(
        request.platform,
        request.page,
        request.action
      );

    if (learned) {

      const cached =
        this.page
          .locator(
            learned.selector
          )
          .first();

      if (await cached.count() > 0) {

        const valid =
          await this.verifyCachedSelector(
            cached,
            learned
          );

        if (valid) {

          this.memory.update(
            request.platform,
            request.page,
            request.action,
            learned.selector,
            true
          );

          this.lastResolutionSelector =
          learned.selector;

        return cached;

        }

      }

      this.memory.update(
        request.platform,
        request.page,
        request.action,
        learned.selector,
        false
      );

    }

    const snapshot =
      await this.snapshot.capture();

    console.log("");
    console.log("========== SNAPSHOT ELEMENTS ==========");
    console.log(
      snapshot.elements
        .filter(e => e.visible)
        .map(e => ({
          tag: e.tag,
          name: e.name,
          role: e.role,
          text: e.text,
          aria: e.ariaLabel,
          placeholder: e.placeholder,
          editable: e.editable
        }))
    );

    const ranked =
      this.strategy.rank(
        snapshot.elements,
        request
      );

    if (ranked.length === 0) {

      throw new Error(
        [
          "AdaptiveEngine failed.",
          `platform=${request.platform}`,
          `page=${request.page}`,
          `action=${request.action}`,
          `description=${request.description}`
        ].join(" ")
      );

    }

    for (const candidate of ranked) {

      const selectors =
        this.buildSelectors(
          candidate.element
        );

      try {

        let locator: Locator | null = null;

        for (const selector of selectors) {

          const candidateLocator =
            this.page.locator(selector);

          if (await candidateLocator.count() === 0) {
            continue;
          }

          const first =
            candidateLocator.first();

          if (!(await first.isVisible())) {
            continue;
          }

          if (!(await first.isEnabled())) {
            continue;
          }

          locator = first;
          break;

        }

        if (!locator) {
          continue;
        }

        if (
          await locator.count() === 0
        ) {
          continue;
        }

        if (
          !(await locator.isVisible())
        ) {
          continue;
        }

        if (
          !(await locator.isEnabled())
        ) {
          continue;
        }

        if (
          request.value !== undefined
        ) {

          const editable =
            await locator.evaluate(el => {

              const tag =
                el.tagName.toLowerCase();

              return (

                tag === "input" ||

                tag === "textarea" ||

                el.hasAttribute("contenteditable")

              );

            });

          if (!editable) {
            continue;
          }

        }

        this.memory.save({

          platform:
            request.platform,

          page:
            request.page,

          action:
            request.action,

          description:
            request.description,

          selectors:
            selectors.map(selector => ({

              selector,

              confidence: 1,

              role:
                candidate.element.role,

              text:
                candidate.element.text,

              ariaLabel:
                candidate.element.ariaLabel,

              placeholder:
                candidate.element.placeholder,

              tag:
                candidate.element.tag

            })),

          confidence: 1,

          successCount: 0,

          failureCount: 0,

          lastVerified:
            new Date().toISOString()

        });

        this.lastResolutionSelector =
      selectors[0] ?? null;

    return locator;

      }

      catch {

        continue;

      }

    }

    throw new Error(
      "No valid ranked candidate found."
    );

  }

  async find(
    request: SearchRequest
  ): Promise<Locator> {

    return this.resolve(
      request
    );

  }







  private async visualRecovery(
    request: SearchRequest
  ): Promise<Locator | null> {

    const snapshot =
      await this.snapshot.capture();

    const ranked =
      this.strategy.rank(
        snapshot.elements,
        request
      );

    if (ranked.length === 0) {
      return null;
    }

    const match =
      ranked[0].element;

    const selectors =
      this.buildSelectors(match);

    const locator =
      this.page
        .locator(
          selectors.join(", ")
        )
        .first();

    if (await locator.count() === 0) {
      return null;
    }

    return locator;

  }




  private async extractOCR(
    image: string
  ): Promise<string> {

    try {

      const result =
        await Tesseract.recognize(
          image,
          "eng"
        );

      return (
        result.data.text ?? ""
      ).trim();

    } catch {

      return "";

    }

  }


  private async captureFailureContext(
    request: SearchRequest
  ): Promise<string> {

    const dir =
      ".adaptive-failures";

    fs.mkdirSync(
      dir,
      { recursive: true }
    );

    const file =
      path.join(
        dir,
        `${Date.now()}-${request.platform}-${request.page}-${request.action}.png`
      );

    await this.page.screenshot({
      path: file,
      fullPage: true
    });

    return file;

  }




  private async selfUpgradeStrategy(
    request: SearchRequest,
    previousError: unknown
  ): Promise<Locator | null> {

    console.log(
      "========== ADAPTIVE SELF-UPGRADE =========="
    );

    // --------------------------------------------------------
    // Capture the current UI after the failure.
    // --------------------------------------------------------

    let snapshot;

    try {
      snapshot =
        await this.snapshot.capture();
    } catch {
      snapshot = null;
    }

    if (!snapshot) {
      return null;
    }

    // --------------------------------------------------------
    // Generate candidate strategies directly from the current
    // DOM snapshot. This is the first self-upgrade layer:
    // the engine is no longer restricted to its old selector.
    // --------------------------------------------------------

    const candidates: string[] = [];

    for (
      const element of snapshot.elements
    ) {

      if (!element.visible) {
        continue;
      }

      if (!element.enabled) {
        continue;
      }

      if (
        element.bounds.width <= 0 ||
        element.bounds.height <= 0
      ) {
        continue;
      }

      if (
        element.ariaLabel
      ) {
        candidates.push(
          `[aria-label="${this.escapeSelectorValue(
            element.ariaLabel
          )}"]`
        );
      }

      if (
        element.dataTestId
      ) {
        candidates.push(
          `[data-testid="${this.escapeSelectorValue(
            element.dataTestId
          )}"]`
        );
      }

      if (
        element.elementId
      ) {
        candidates.push(
          `#${this.escapeSelectorValue(
            element.elementId
          )}`
        );
      }

      if (
        element.name
      ) {
        candidates.push(
          `[name="${this.escapeSelectorValue(
            element.name
          )}"]`
        );
      }

      if (
        element.placeholder
      ) {
        candidates.push(
          `[placeholder="${this.escapeSelectorValue(
            element.placeholder
          )}"]`
        );
      }

      if (
        element.role &&
        element.text
      ) {
        candidates.push(
          `role=${element.role}[text="${element.text}"]`
        );
      }

      if (
        element.text
      ) {
        candidates.push(
          `text=${element.text}`
        );
      }
    }

    // Remove duplicates while preserving ranking order.
    const unique =
      [...new Set(candidates)];

    // --------------------------------------------------------
    // Try newly generated strategies.
    // --------------------------------------------------------

    for (
      const selector of unique.slice(0, 30)
    ) {

      try {

        const locator =
          selector.startsWith("text=")
            ? this.page.getByText(
                selector.slice(5),
                { exact: false }
              ).first()
            : this.page.locator(
                selector
              ).first();

        if (
          !(await locator.count())
        ) {
          continue;
        }

        if (
          !(await locator.isVisible())
        ) {
          continue;
        }

        if (
          !(await locator.isEnabled().catch(
            () => true
          ))
        ) {
          continue;
        }

        const box =
          await locator.boundingBox()
            .catch(() => null);

        if (
          !box ||
          box.width <= 0 ||
          box.height <= 0
        ) {
          continue;
        }

        console.log(
          "🧠 Self-upgrade candidate:",
          selector
        );

        // Return the candidate to the healing loop.
        // It is NOT learned yet.
        return locator;

      } catch {
        continue;
      }
    }

    console.log(
      "⚠️ Self-upgrade exhausted generated strategies."
    );

    return null;
  }

  private escapeSelectorValue(
    value: string
  ): string {

    return value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');
  }

  private async executeWithHealing(
    request: SearchRequest,
    action: (locator: Locator) => Promise<void>
  ): Promise<void> {

    const maxAttempts = 5;

    let lastError: unknown =
      new Error("Adaptive execution failed.");

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt++
    ) {

      this.lastResolutionSelector = null;

      try {

        const locator =
          await this.resolve(request);

        const before =
          await this.human.fingerprint();

        const beforeScroll =
          await this.page.evaluate(
            () => ({
              x: window.scrollX,
              y: window.scrollY
            })
          );

        console.log("");
        console.log(
          `========== ADAPTIVE ATTEMPT ${attempt + 1}/${maxAttempts} ==========`
        );

        await action(locator);

        const verified =
          await this.verifyAdaptiveOutcome(
            request,
            locator,
            before,
            beforeScroll
          );

        if (!verified) {

          throw new Error(
            [
              "Action executed but resulting state",
              "could not be verified.",
              `action=${request.action}`
            ].join(" ")
          );
        }

        // ----------------------------------------------------
        // IMPORTANT:
        // Learn ONLY after the action has actually succeeded
        // and its resulting state has been verified.
        // ----------------------------------------------------

        if (
          this.lastResolutionSelector
        ) {
          this.memory.update(
            request.platform,
            request.page,
            request.action,
            this.lastResolutionSelector,
            true
          );
        }

        console.log(
          "✅ Adaptive action verified."
        );

        return;

      } catch (error) {

        lastError = error;

        if (
          this.lastResolutionSelector
        ) {
          this.memory.update(
            request.platform,
            request.page,
            request.action,
            this.lastResolutionSelector,
            false
          );
        }

        console.warn(
          `⚠️ Adaptive strategy ${attempt + 1} failed:`,
          error instanceof Error
            ? error.message
            : error
        );

        // ----------------------------------------------------
        // Capture the failure and inspect the current UI.
        // ----------------------------------------------------

        let screenshot: string | undefined;

        try {
          screenshot =
            await this.captureFailureContext(
              request
            );
        } catch {}

        if (screenshot) {

          try {

            const ocrText =
              await this.extractOCR(
                screenshot
              );

            if (
              request.description &&
              ocrText
                .toLowerCase()
                .includes(
                  request.description
                    .toLowerCase()
                )
            ) {

              try {

                const ocrLocator =
                  this.page
                    .getByText(
                      request.description,
                      {
                        exact: false
                      }
                    )
                    .first();

                if (
                  await ocrLocator.count() > 0
                ) {

                  const before =
                    await this.human.fingerprint();

                  await action(
                    ocrLocator
                  );

                  if (
                    await this.verifyAdaptiveOutcome(
                      request,
                      ocrLocator,
                      before,
                      await this.page.evaluate(
                        () => ({
                          x: window.scrollX,
                          y: window.scrollY
                        })
                      )
                    )
                  ) {
                    console.log(
                      "✅ OCR recovery verified."
                    );
                    return;
                  }
                }

              } catch {}
            }

          } catch {}
        }

        // ----------------------------------------------------
        // Ask the complete resolver pipeline for a fresh
        // strategy after the UI has changed.
        // ----------------------------------------------------

        try {

          const recovered =
            await this.pipeline.resolve(
              request
            );

          if (recovered) {

            const before =
              await this.human.fingerprint();

            const beforeScroll =
              await this.page.evaluate(
                () => ({
                  x: window.scrollX,
                  y: window.scrollY
                })
              );

            await action(
              recovered
            );

            if (
              await this.verifyAdaptiveOutcome(
                request,
                recovered,
                before,
                beforeScroll
              )
            ) {

              console.log(
                "✅ Resolver-pipeline recovery verified."
              );

              return;
            }
          }

        } catch (recoveryError) {

          lastError =
            recoveryError;

        }

        // ----------------------------------------------------
        // Force a fresh DOM/strategy ranking before the next
        // attempt. This prevents the engine from repeatedly
        // trusting a failed strategy.
        // ----------------------------------------------------

        try {
          await this.snapshot.capture();
        } catch {}

        if (
          attempt < maxAttempts - 1
        ) {

          await this.human.pause(
            700,
            1500
          );

          continue;
        }
      }
    }

    // --------------------------------------------------------
    // NEVER silently claim success.
    // Every viable recovery strategy was exhausted.
    // --------------------------------------------------------


    // --------------------------------------------------------
    // FINAL SELF-UPGRADE:
    // inspect the current UI and generate a strategy that was
    // not present in the original resolver result.
    // --------------------------------------------------------

    try {

      const upgraded =
        await this.selfUpgradeStrategy(
          request,
          lastError
        );

      if (upgraded) {

        const before =
          await this.human.fingerprint();

        const beforeScroll =
          await this.page.evaluate(
            () => ({
              x: window.scrollX,
              y: window.scrollY
            })
          );

        await action(upgraded);

        const verified =
          await this.verifyAdaptiveOutcome(
            request,
            upgraded,
            before,
            beforeScroll
          );

        if (verified) {

          console.log(
            "✅ SELF-UPGRADED STRATEGY VERIFIED."
          );

          return;
        }
      }

    } catch (upgradeError) {

      lastError =
        upgradeError;

      console.warn(
        "⚠️ Self-upgrade attempt failed:",
        upgradeError instanceof Error
          ? upgradeError.message
          : upgradeError
      );
    }

    const failure = new Error(
      [
        "ADAPTIVE_CAPABILITY_FAILURE",
        `platform=${request.platform}`,
        `page=${request.page}`,
        `action=${request.action}`,
        `description=${request.description}`,
        `attempts=${maxAttempts}`,
        "All available adaptive strategies failed verification."
      ].join(" | ")
    );

    (
      failure as Error & {
        code?: string;
        capability?: string;
        retryable?: boolean;
        attempts?: number;
        cause?: unknown;
      }
    ).code =
      "ADAPTIVE_CAPABILITY_FAILURE";

    (
      failure as Error & {
        capability?: string;
      }
    ).capability =
      `${request.platform}.${request.action}`;

    (
      failure as Error & {
        retryable?: boolean;
      }
    ).retryable = false;

    (
      failure as Error & {
        attempts?: number;
      }
    ).attempts = maxAttempts;

    (
      failure as Error & {
        cause?: unknown;
      }
    ).cause = lastError;

    throw failure;
  }

  private async verifyAdaptiveOutcome(
    request: SearchRequest,
    locator: Locator,
    before: string,
    beforeScroll: {
      x: number;
      y: number;
    }
  ): Promise<boolean> {

    const action =
      request.action.toLowerCase();

    // --------------------------------------------------------
    // Typing/filling must produce the requested value.
    // --------------------------------------------------------

    if (
      action.includes("type") ||
      action.includes("fill") ||
      action.includes("compose") ||
      action.includes("message")
    ) {

      const expected =
        request.value ?? "";

      if (!expected) {
        return true;
      }

      const actual =
        await locator
          .evaluate(
            (element) => {

              const el =
                element as
                  HTMLInputElement &
                  HTMLTextAreaElement;

              return (
                "value" in el
                  ? String(el.value ?? "")
                  : String(
                      element.textContent ?? ""
                    )
              );
            }
          )
          .catch(() => "");

      return actual.includes(
        expected.slice(
          0,
          Math.min(
            expected.length,
            32
          )
        )
      );
    }

    // --------------------------------------------------------
    // Scrolling needs scroll-state verification rather than
    // DOM fingerprint verification.
    // --------------------------------------------------------

    if (
      action.includes("scroll")
    ) {

      const afterScroll =
        await this.page.evaluate(
          () => ({
            x: window.scrollX,
            y: window.scrollY
          })
        );

      const moved =
        afterScroll.x !== beforeScroll.x ||
        afterScroll.y !== beforeScroll.y;

      if (moved) {
        return true;
      }

      return await locator
        .isVisible()
        .catch(() => false);
    }

    // --------------------------------------------------------
    // Normal interactions must cause an observable state
    // change OR focus the intended target.
    // --------------------------------------------------------

    if (
      await this.human.verifyChanged(
        before,
        3500
      )
    ) {
      return true;
    }

    const focused =
      await locator
        .evaluate(
          element => {
            const active =
              document.activeElement;

            return (
              active === element ||
              !!(
                active &&
                element.contains(active)
              )
            );
          }
        )
        .catch(() => false);

    return focused;
  }

  async click(
    request: SearchRequest
  ): Promise<void> {

    await this.validator.stage(

      "Click",

      async () =>

        this.executeWithHealing(

          request,

          async locator => {
            await this.human.click(locator);
          }

        )

    );

    ValidationPrinter.print(

      this.validator.collector.build(

        request.platform,

        request.page,

        request.action,

        Date.now()

      )

    );

  }



  async fill(
    request: SearchRequest,
    value: string
  ): Promise<void> {

    console.log("");
    console.log("========== FILL REQUEST ==========");
    console.log(request);

    request.value = value;

    await this.validator.stage(

      "Fill",

      async () =>

        this.executeWithHealing(

          request,

          async locator => {
            await this.human.fill(
              locator,
              value
            );
          }

        )

    );

    ValidationPrinter.print(

      this.validator.collector.build(

        request.platform,

        request.page,

        request.action,

        Date.now()

      )

    );

  }


  async type(
    request: SearchRequest
  ): Promise<void> {

    await this.validator.stage(

      "Type",

      async () =>

        this.executeWithHealing(

          request,

          async locator =>
            await this.human.fill(
              locator,
              request.value ?? ""
            )

        )

    );

    ValidationPrinter.print(

      this.validator.collector.build(

        request.platform,

        request.page,

        request.action,

        Date.now()

      )

    );

  }

  async hover(
    request: SearchRequest
  ): Promise<void> {

    await this.validator.stage(

      "Hover",

      async () =>

        this.executeWithHealing(

          request,

          locator => locator.hover()

        )

    );

  }

  async press(
    request: SearchRequest,
    key: string
  ): Promise<void> {

    await this.validator.stage(

      "Press",

      async () =>

        this.executeWithHealing(

          request,

          locator =>
            locator.press(key)

        )

    );

  }

  async exists(
    request: SearchRequest
  ): Promise<boolean> {

    try {

      await this.resolve(request);

      return true;

    } catch {

      return false;

    }

  }

  async visible(
    request: SearchRequest
  ): Promise<boolean> {

    try {

      const locator =
        await this.resolve(request);

      return await locator.isVisible();

    } catch {

      return false;

    }

  }

  async text(
    request: SearchRequest
  ): Promise<string> {

    const locator =
      await this.resolve(request);

    return (
      await locator.textContent()
    ) ?? "";

  }

  async count(
    request: SearchRequest
  ): Promise<number> {

    const locator =
      await this.resolve(request);

    return await locator.count();

  }

  async allText(
    request: SearchRequest
  ): Promise<string[]> {

    const locator =
      await this.resolve(request);

    return await locator.allTextContents();

  }

  async scroll(
    request: SearchRequest
  ): Promise<void> {

    const locator =
      await this.resolve(request);

    await this.human.scrollIntoView(locator);

  }

  async upload(
    request: SearchRequest,
    file: string
  ): Promise<void> {

    const locator =
      await this.resolve(request);

    await locator.setInputFiles(file);

  }

  async wait(
    request: SearchRequest
  ): Promise<void> {

    const locator =
      await this.resolve(request);

    await locator.waitFor({
      state: "visible"
    });

  }

}
