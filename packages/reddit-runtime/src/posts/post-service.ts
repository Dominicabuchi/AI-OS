import { Page } from "playwright";

import {
  HumanBrowser
} from "@ai-os/browser-runtime";

import {
  RedditPost
} from "./post-types";

export interface PublishResult {

  success: boolean;

  postId?: string;

  postUrl?: string;

flair?: string;

nsfw?: boolean;

spoiler?: boolean;

brandAffiliate?: boolean;

error?: string;

}

export class PostService {

  readonly human: HumanBrowser;

  constructor(
    readonly page: Page
  ) {

    this.human =
      new HumanBrowser(page);

  }

  async openSubreddit(
    subreddit: string
  ) {

    console.log("Opening submit page...");

    await this.page.goto(
      `https://www.reddit.com/r/${subreddit}/submit`,
      {
        waitUntil:"domcontentloaded",
        timeout:60000
      }
    );

    console.log("Submit page loaded.");

  }

  async fillTitle(
    title: string
  ) {

    console.log("Filling title...");

    const titleInput =
      this.page.locator(
        'textarea[name="title"], textarea[aria-label="Title"], textarea[placeholder="Title"]'
      ).first();

    await titleInput.waitFor({
      state: "visible",
      timeout: 15000
    });

    await titleInput.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(400);
    await titleInput.fill(title);
    await this.page.waitForTimeout(500);

    const actual =
      await titleInput.inputValue();

    if (
      actual.trim() !==
      title.trim()
    ) {
      throw new Error(
        `Reddit title verification failed. Expected ${title.length} chars, got ${actual.length}.`
      );
    }

    console.log("Reddit title filled and verified.");

  }

  async fillBody(
    body:string
  ){

    console.log("Filling body...");

    /*
     * Reddit renders multiple contenteditable nodes, including hidden
     * editor instances. Never use .last(); resolve the live visible
     * post-body editor semantically.
     */
    const candidates =
      this.page.locator(
        '[role="textbox"], [contenteditable]:not([contenteditable="false"]), textarea'
      );

    let bodyEditor:
      import("playwright").Locator |
      undefined;

    let bestScore =
      Number.NEGATIVE_INFINITY;

    const count =
      await candidates.count();

    for (
      let i = 0;
      i < Math.min(count, 100);
      i++
    ) {
      const candidate =
        candidates.nth(i);

      const visible =
        await candidate
          .isVisible()
          .catch(() => false);

      const enabled =
        await candidate
          .isEnabled()
          .catch(() => true);

      if (
        !visible ||
        !enabled
      ) {
        continue;
      }

      const info =
        await candidate.evaluate(
          (el: HTMLElement) => ({
            aria:
              (
                el.getAttribute(
                  "aria-label"
                ) ?? ""
              ).toLowerCase(),
            placeholder:
              (
                el.getAttribute(
                  "placeholder"
                ) ?? ""
              ).toLowerCase(),
            role:
              (
                el.getAttribute(
                  "role"
                ) ?? ""
              ).toLowerCase(),
            name:
              (
                el.getAttribute(
                  "name"
                ) ?? ""
              ).toLowerCase(),
            slot:
              (
                el.getAttribute(
                  "slot"
                ) ?? ""
              ).toLowerCase(),
            contenteditable:
              (
                el.getAttribute(
                  "contenteditable"
                ) ?? ""
              ).toLowerCase(),
            tag:
              el.tagName
                .toLowerCase()
          })
        );

      const description =
        [
          info.aria,
          info.placeholder,
          info.name,
          info.slot
        ]
          .join(" ")
          .toLowerCase();

      /*
       * Reject the title and subreddit search controls.
       */
      if (
        /search/.test(
          description
        ) ||
        info.name ===
          "title" ||
        info.aria ===
          "title" ||
        info.placeholder ===
          "title"
      ) {
        continue;
      }

      let score = 0;

      if (
        /post body|body text|post text|body/.test(
          description
        )
      ) {
        score += 200;
      }

      if (
        info.role ===
        "textbox"
      ) {
        score += 80;
      }

      if (
        info.contenteditable ===
          "true" ||
        info.contenteditable ===
          "plaintext-only"
      ) {
        score += 70;
      }

      if (
        info.slot ===
        "editor"
      ) {
        score += 60;
      }

      if (
        score >
        bestScore
      ) {
        bodyEditor =
          candidate;

        bestScore =
          score;
      }
    }

    if (
      !bodyEditor ||
      bestScore < 100
    ) {
      throw new Error(
        "Reddit visible post-body editor could not be resolved."
      );
    }

    console.log(
      `Reddit live body editor resolved. score=${bestScore}`
    );

    await bodyEditor
      .scrollIntoViewIfNeeded();

    await this.page
      .waitForTimeout(350);

    await bodyEditor.click();

    await this.page
      .waitForTimeout(250);

    await bodyEditor.fill(
      body
    );

    await this.page
      .waitForTimeout(500);

    const actual =
      await bodyEditor.evaluate(
        (el: HTMLElement) => {
          if (
            el instanceof
            HTMLTextAreaElement ||
            el instanceof
            HTMLInputElement
          ) {
            return el.value;
          }

          return (
            el.innerText ||
            el.textContent ||
            ""
          );
        }
      );

    const normalize =
      (value: string) =>
        value
          .replace(/\s+/g, " ")
          .trim();

    if (
      !normalize(actual).includes(
        normalize(body)
      )
    ) {
      throw new Error(
        "Reddit post body was filled but verification failed."
      );
    }

    console.log(
      "Reddit post body filled and verified."
    );

  }



  async fillLink(
    url: string
  ) {

    console.log("Switching to Link post...");

    await this.human.adaptiveClick({

      platform: "reddit",

      page: "submit",

      action: "link-tab",

      description:
        "Switch to Link Post"

    });

    await this.page.waitForTimeout(3000);

    console.log("");
    console.log("========== CUSTOM ELEMENTS ==========");

    console.log(
      await this.page.evaluate(() =>
        Array.from(
          document.querySelectorAll("*")
        )
        .filter(e => e.tagName.includes("-"))
        .slice(0,200)
        .map(e=>e.tagName)
      )
    );

    console.log("");
    console.log("========== AFTER LINK TAB ==========");
    console.log(await this.page.url());

    console.log(await this.page.evaluate(() => {

      return Array.from(
        document.querySelectorAll(
          "input, textarea, div[contenteditable], [contenteditable='true']"
        )
      ).map(e => ({

        tag: e.tagName,

        name: e.getAttribute("name"),

        aria: e.getAttribute("aria-label"),

        placeholder: e.getAttribute("placeholder"),

        editable:
          e.getAttribute("contenteditable"),

        visible:
          (e as HTMLElement).offsetParent !== null

      }));

    }));

    console.log("Entering URL...");

    await this.human.adaptiveFill({

      platform: "reddit",

      page: "submit",

      action: "link",

      description:
        "External URL"

    }, url);

  }

  async prepareSubmission(
    options?: {
      flair?: string;
      nsfw?: boolean;
      spoiler?: boolean;
      brandAffiliate?: boolean;
    }
  ): Promise<{
    flair?: string;
    nsfw: boolean;
    spoiler: boolean;
    brandAffiliate: boolean;
  }> {

    console.log("Preparing Reddit submission...");

    const result = {
      flair: undefined as string | undefined,
      nsfw: false,
      spoiler: false,
      brandAffiliate: false
    };

    /*
     * ==========================================================
     * FLAIR
     * ==========================================================
     */

    const flairButton =
      this.page.getByRole("button", {
        name: /add flair and tags/i
      }).first();

    if (
      await flairButton.count() > 0 &&
      await flairButton.isVisible().catch(() => false)
    ) {

      const buttonText =
        await flairButton.innerText();

      const required =
        /\*/.test(buttonText) ||
        /required/i.test(buttonText);

      if (required || options?.flair) {

        console.log("Opening Reddit flair selector...");

        await flairButton.click();

        await this.page.waitForTimeout(500);

        let dialog =
          this.page.locator(
            '[aria-label="Post Flair Selection form"]'
          ).first();

        if (
          await dialog.count() === 0 ||
          !(await dialog.isVisible().catch(() => false))
        ) {

          dialog =
            this.page.getByRole("form", {
              name: /post flair selection/i
            }).first();
        }

        if (
          await dialog.count() === 0 ||
          !(await dialog.isVisible().catch(() => false))
        ) {

          throw new Error(
            "Reddit flair selector opened but the selection form is not visible."
          );
        }

        /*
         * IMPORTANT:
         * Reddit's actual selectable controls are:
         *
         * faceplate-radio-input[role="radio"]
         *
         * Do not click the inner text/span.
         */
        let radios =
          dialog.locator(
            'faceplate-radio-input[role="radio"]'
          );

        let radioCount =
          await radios.count();

        /*
         * Some Reddit communities hide additional flairs
         * behind "View all flairs".
         */
        if (radioCount === 0) {

          const viewAll =
            dialog.getByText(
              "View all flairs",
              { exact: true }
            ).first();

          if (
            await viewAll.count() > 0 &&
            await viewAll.isVisible().catch(() => false)
          ) {

            console.log(
              "Opening all Reddit flairs..."
            );

            await viewAll.click();

            await this.page.waitForTimeout(500);

            radios =
              dialog.locator(
                'faceplate-radio-input[role="radio"]'
              );

            radioCount =
              await radios.count();
          }
        }

        if (radioCount === 0) {

          throw new Error(
            "Reddit requires a flair, but no faceplate-radio-input controls were found."
          );
        }

        const flairOptions: Array<{
          index: number;
          label: string;
        }> = [];

        for (let i = 0; i < radioCount; i++) {

          const radio =
            radios.nth(i);

          const label =
            (
              await radio.innerText().catch(() => "")
            ).trim();

          if (!label) {
            continue;
          }

          flairOptions.push({
            index: i,
            label
          });
        }

        console.log(
          "Available Reddit flairs:",
          flairOptions.map(x => x.label)
        );

        /*
         * Explicit requested flair.
         */
        if (options?.flair) {

          const wanted =
            options.flair.trim().toLowerCase();

          const match =
            flairOptions.find(
              item =>
                item.label.toLowerCase() === wanted
            );

          if (!match) {

            throw new Error(
              `Requested flair "${options.flair}" was not found.`
            );
          }

          const targetRadio =
            radios.nth(match.index);

          console.log(
            `Selecting Reddit flair: ${match.label}`
          );

          let selected = false;

          /*
           * Reddit's faceplate-radio-input may exist in the DOM
           * but be reported invisible by Playwright.
           *
           * First try the associated visible label/container.
           */

          const radioId =
            await targetRadio.getAttribute("id");

          if (radioId) {

            const label =
              dialog.locator(
                `label[for="${radioId}"]`
              ).first();

            if (
              await label.count() > 0 &&
              await label.isVisible().catch(() => false)
            ) {

              await label.click();

              selected = true;

              console.log(
                "✓ Selected flair through associated label."
              );
            }
          }

          /*
           * Try a visible ancestor/container used by Reddit's
           * faceplate components.
           */

          if (!selected) {

            const visibleContainer =
              targetRadio.locator(
                "xpath=ancestor::*[self::label or @role='radio' or @data-testid][1]"
              ).first();

            if (
              await visibleContainer.count() > 0 &&
              await visibleContainer.isVisible().catch(() => false)
            ) {

              await visibleContainer.click();

              selected = true;

              console.log(
                "✓ Selected flair through visible container."
              );
            }
          }

          /*
           * Final fallback: activate the actual Reddit radio
           * element through the DOM.
           */

          if (!selected) {

            await targetRadio.evaluate(
              (element: HTMLElement) => {
                element.click();
              }
            );

            selected = true;

            console.log(
              "✓ Selected flair through DOM activation."
            );
          }

          await this.page.waitForTimeout(700);

          /*
           * Verify Reddit actually selected the requested flair.
           */

          const checkedRadios =
            dialog.locator(
              'faceplate-radio-input[role="radio"][aria-checked="true"]'
            );

          const checkedCount =
            await checkedRadios.count();

          if (checkedCount === 0) {

            throw new Error(
              `Reddit did not mark flair "${match.label}" as selected.`
            );
          }

          const checkedLabel =
            (
              await checkedRadios
                .first()
                .innerText()
                .catch(() => "")
            ).trim();

          console.log(
            `Reddit selected flair: ${checkedLabel}`
          );

          if (
            checkedLabel.toLowerCase() !==
            match.label.toLowerCase()
          ) {

            throw new Error(
              `Wrong flair selected. Expected "${match.label}", got "${checkedLabel}".`
            );
          }

          result.flair =
            checkedLabel;

          console.log(
            `✓ Flair selection verified: ${result.flair}`
          );
        }

        /*
         * Automatic selection:
         * choose a real flair, never "No flair".
         */
        else {

          const candidate =
            flairOptions.find(
              item =>
                !/^no flair$/i.test(item.label)
            );

          if (!candidate) {

            throw new Error(
              "Reddit requires flair but only 'No flair' was available."
            );
          }

          await radios
            .nth(candidate.index)
            .click();

          result.flair =
            candidate.label;
        }

        await this.page.waitForTimeout(300);

        /*
         * Verify Reddit actually selected a radio.
         */
        const selected =
          dialog.locator(
            'faceplate-radio-input[role="radio"][aria-checked="true"]'
          );

        if (await selected.count() === 0) {

          throw new Error(
            `Reddit flair "${result.flair}" was clicked but was not marked selected.`
          );
        }

        /*
         * Apply the selection.
         */
        const addButton =
          dialog.getByRole("button", {
            name: /^add$/i
          }).first();

        if (
          await addButton.count() > 0 &&
          await addButton.isVisible().catch(() => false)
        ) {

          await addButton.click();

          await this.page.waitForTimeout(500);
        }

        console.log(
          `✅ Reddit flair selected: ${result.flair}`
        );
      }
    }

    /*
     * ==========================================================
     * OPTIONAL NSFW
     * ==========================================================
     *
     * Never enable automatically.
     */

    if (options?.nsfw === true) {

      const nsfw =
        this.page.getByText(
          /not safe for work \(nsfw\)/i
        ).first();

      if (
        await nsfw.count() === 0 ||
        !(await nsfw.isVisible().catch(() => false))
      ) {

        throw new Error(
          "NSFW requested but Reddit's NSFW control is unavailable."
        );
      }

      await nsfw.click();

      result.nsfw = true;

      console.log("✅ NSFW enabled.");
    }

    /*
     * ==========================================================
     * OPTIONAL SPOILER
     * ==========================================================
     */

    if (options?.spoiler === true) {

      const spoiler =
        this.page.getByText(
          /^spoiler$/i
        ).first();

      if (
        await spoiler.count() === 0 ||
        !(await spoiler.isVisible().catch(() => false))
      ) {

        throw new Error(
          "Spoiler requested but Reddit's spoiler control is unavailable."
        );
      }

      await spoiler.click();

      result.spoiler = true;

      console.log("✅ Spoiler enabled.");
    }

    /*
     * ==========================================================
     * OPTIONAL BRAND AFFILIATE
     * ==========================================================
     */

    if (options?.brandAffiliate === true) {

      const brand =
        this.page.getByText(
          /brand affiliate/i
        ).first();

      if (
        await brand.count() === 0 ||
        !(await brand.isVisible().catch(() => false))
      ) {

        throw new Error(
          "Brand affiliate requested but Reddit's control is unavailable."
        );
      }

      await brand.click();

      result.brandAffiliate = true;

      console.log(
        "✅ Brand affiliate enabled."
      );
    }

    /*
     * ==========================================================
     * FINAL SUBMISSION VALIDATION
     * ==========================================================
     */

    const postButton =
      this.page.getByRole("button", {
        name: /^post$/i
      }).last();

    await postButton.waitFor({
      state: "visible",
      timeout: 10000
    });

    if (await postButton.isDisabled()) {

      throw new Error(
        "Reddit Post button is still disabled after submission preparation."
      );
    }

    console.log(
      "✅ Submission requirements satisfied."
    );

    console.log(
      "Flair:",
      result.flair || "none"
    );

    console.log(
      "NSFW:",
      result.nsfw
    );

    console.log(
      "Spoiler:",
      result.spoiler
    );

    console.log(
      "Brand affiliate:",
      result.brandAffiliate
    );

    return result;
  }

  async submit() {

    console.log("Submitting post...");

    const postButton =
      this.page.getByRole("button", {
        name: /^post$/i
      }).last();

    await postButton.waitFor({
      state: "visible",
      timeout: 10000
    });

    if (await postButton.isDisabled()) {

      throw new Error(
        "Cannot submit: Reddit Post button is disabled."
      );
    }

    await postButton.scrollIntoViewIfNeeded();

    await this.page.waitForTimeout(500);

    try {

      await postButton.click({
        timeout: 10000
      });

    } catch {

      console.log(
        "Normal Post click was intercepted; activating actual button DOM..."
      );

      await postButton.evaluate(
        (button: HTMLElement) => button.click()
      );
    }

    console.log(
      "Post submission activated."
    );
  }



  async publish(
    post:RedditPost
  ):Promise<PublishResult>{

    await this.openSubreddit(
      post.subreddit
    );

    await this.fillTitle(
      post.title
    );

    if (post.url) {

      await this.fillLink(
        post.url
      );

    }

    else if (post.body) {

      await this.fillBody(
        post.body
      );

    }

    const submission =
  await this.prepareSubmission(
    (post as RedditPost & {
      flair?: string;
      nsfw?: boolean;
      spoiler?: boolean;
      brandAffiliate?: boolean;
    })
  );

await this.submit();

    console.log("Waiting for Reddit to confirm the created post...");

    let postId: string | undefined;
    let postUrl: string | undefined;

    /*
     * Reddit does not always redirect to:
     *   ?created=t3_xxxxx
     *
     * It may instead return to the subreddit while rendering
     * the newly-created post into the DOM.
     */

    for (let attempt = 1; attempt <= 10; attempt++) {

      await this.page.waitForTimeout(1000);

      const currentUrl =
        this.page.url();

      console.log(
        `Confirmation attempt ${attempt}/10: ${currentUrl}`
      );

      /*
       * First check for the traditional created=t3_... URL.
       */
      const currentPath =
        new URL(
          currentUrl,
          "https://www.reddit.com"
        ).pathname.toLowerCase();

      const expectedSubredditPath =
        `/r/${post.subreddit.toLowerCase()}/`;

      const currentPathMatchesSubreddit =
        currentPath.startsWith(
          expectedSubredditPath
        );

      const createdMatch =
        currentUrl.match(
          /created=(t3_[A-Za-z0-9_-]+)/
        );

      if (
        createdMatch &&
        currentPathMatchesSubreddit
      ) {

        postId = createdMatch[1];

        postUrl =
          new URL(
            currentUrl,
            "https://www.reddit.com"
          ).toString();

        break;
      }

      /*
       * Look for Reddit post links in the live DOM.
       */
      const postLinks =
        await this.page.locator(
          `a[href*="/r/${post.subreddit}/comments/"]`
        ).evaluateAll(
          links =>
            links
              .map(link => ({
                href:
                  (link as HTMLAnchorElement).href,
                text:
                  (link.textContent || "").trim()
              }))
              .filter(item =>
                /\/comments\/[a-z0-9]+/i.test(
                  item.href
                )
              )
        );

      if (postLinks.length > 0) {

        /*
         * Prefer the newest/relevant post link.
         */
        const candidate =
          postLinks[0];

        postUrl =
          candidate.href;

        const match =
          postUrl.match(
            /\/comments\/([a-z0-9]+)/i
          );

        if (match) {

          const redditShortId =
            match[1];

          postId =
            redditShortId.startsWith("t3_")
              ? redditShortId
              : `t3_${redditShortId}`;

          break;
        }
      }
    }

    /*
     * Final confirmation.
     *
     * Never report success merely because Reddit returned
     * to a subreddit page.
     */
    if (!postUrl || !postId) {

      throw new Error(
        `Post submission could not be confirmed. ` +
        `Reddit returned: ${this.page.url()}`
      );
    }

    console.log("");
    console.log("========== POST CONFIRMED ==========");
    console.log("Post ID:", postId);
    console.log("Post URL:", postUrl);

    return {
      success: true,
      postId,
      postUrl
    };
  }

}
