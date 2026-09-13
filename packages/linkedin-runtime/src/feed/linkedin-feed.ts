import { HumanBrowser } from "@ai-os/browser-runtime";
import { LinkedInPostOptions } from "../types";
import { LinkedInMedia } from "../types/linkedin-media";
import { LinkedInAuthor } from "../types/linkedin-author";
import { LinkedInPost } from "../types/linkedin-post";

export class LinkedInFeed {

  
  private cursor = 0;

  private async retry<T>(
    fn: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    let delay = 500;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }

    throw new Error("Retry failed");
  }

  private makeId(post: Partial<LinkedInPost>): string {
    if (post.urn) return post.urn;

    return Buffer
      .from(`${post.author?.name}:${post.text}`)
      .toString("base64");
  }

constructor(
    private readonly human: HumanBrowser
  ) {}

  async home(): Promise<void> {
    await this.human.goto("https://www.linkedin.com/feed/");
  }

  async refresh(): Promise<void> {
    await this.human.page.reload({
      waitUntil: "networkidle"
    });
  }

  async getPosts(): Promise<string[]> {
    return this.human.evaluate(() =>
      Array.from(
        document.querySelectorAll("div.feed-shared-update-v2")
      ).map(post => post.textContent ?? "")
    );
  }

  

  filterPosts(
    posts: LinkedInPost[],
    options?: {
      author?: string;
      sponsored?: boolean;
      mediaType?: "image" | "video" | "document" | "link";
      keyword?: string;
    }
  ): LinkedInPost[] {
    return posts.filter(post => {

      if (
        options?.author &&
        !post.author.name.toLowerCase().includes(options.author.toLowerCase())
      ) return false;

      if (
        options?.sponsored !== undefined &&
        post.sponsored !== options.sponsored
      ) return false;

      if (
        options?.mediaType &&
        !post.media.some(m => m.type === options.mediaType)
      ) return false;

      if (
        options?.keyword &&
        !post.text.toLowerCase().includes(options.keyword.toLowerCase())
      ) return false;

      return true;
    });
  }


  async getPost(index: number): Promise<string | null> {
    const posts = await this.getPosts();
    return posts[index] ?? null;
  }

  async like(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "like-post",
      description: `Like post ${index}`
    });
  }

  async comment(
    index: number,
    text: string
  ): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "open-comment",
      description: `Open comments for post ${index}`
    });

    await this.human.adaptiveType({
      platform: "linkedin",
      page: "feed",
      action: "comment",
      description: `Comment on post ${index}`,
      value: text
    });
  }

  async openAuthor(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "open-author",
      description: `Open author of post ${index}`
    });
  }

  async openComments(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "open-comments",
      description: `Open comments for post ${index}`
    });
  }

  async scroll(): Promise<void> {
    await this.human.scroll();
  }

  async loadMore(): Promise<void> {
    await this.scroll();
    await this.human.page.waitForLoadState("networkidle");
  }


  async unlike(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "unlike-post",
      description: `Unlike post `
    });
  }

  async repost(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "repost-post",
      description: `Repost post `
    });
  }

  async share(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "share-post",
      description: `Share post `
    });
  }

  async save(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "save-post",
      description: `Save post `
    });
  }

  async unsave(index: number): Promise<void> {
    await this.human.adaptiveClick({
      platform: "linkedin",
      page: "feed",
      action: "unsave-post",
      description: `Unsave post `
    });
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.loadMore();
  }

  async createPost(
    options: LinkedInPostOptions
  ): Promise<{
    verified: boolean;
    postUrn?: string;
    postUrl?: string;
  }> {

    await this.human.goto(
      "https://www.linkedin.com/feed/"
    );

    await this.human.page
      .waitForTimeout(2200);

    const currentLinkedInUrl =
      this.human.page.url();

    if (
      /\/login|\/checkpoint|\/challenge/i.test(
        currentLinkedInUrl
      )
    ) {
      throw new Error(
        `LinkedIn authenticated session is unavailable: ${currentLinkedInUrl}`
      );
    }

    const createPostCandidates = [
      this.human.page.locator(
        '[data-view-name="share-sharebox-focus"][role="button"]'
      ),
      this.human.page.getByRole(
        "button",
        {
          name:
            /start a post|create a post/i
        }
      ),
      this.human.page.locator(
        '[aria-label*="Start a post" i]'
      ),
      this.human.page.locator(
        '[aria-label*="Create a post" i]'
      ),
      this.human.page.locator(
        'button:has-text("Start a post")'
      ),
      this.human.page.locator(
        '[role="button"]:has-text("Start a post")'
      ),
      this.human.page.getByText(
        "Start a post",
        {
          exact: false
        }
      )
    ];

    let createPostButton:
      import("playwright").Locator |
      undefined;

    for (
      const candidate
      of createPostCandidates
    ) {
      const count =
        await candidate.count();

      for (
        let i = 0;
        i < Math.min(count, 8);
        i++
      ) {
        const item =
          candidate.nth(i);

        if (
          await item
            .isVisible()
            .catch(() => false)
        ) {
          createPostButton =
            item;

          break;
        }
      }

      if (createPostButton) {
        break;
      }
    }

    if (!createPostButton) {
      throw new Error(
        `LinkedIn create-post control not found on ${this.human.page.url()}`
      );
    }

    await createPostButton
      .scrollIntoViewIfNeeded();

    await this.human.page
      .waitForTimeout(700);

    await createPostButton.click({
      timeout: 10000
    });

    await this.human.page
      .waitForTimeout(1500);

    const postText =
      options.text?.trim() ?? "";

    if (postText) {

      /*
       * LinkedIn's composer DOM changes frequently.
       *
       * Do not depend on one CSS class or data attribute.
       * Discover the live editor semantically on every run.
       */
      let editor:
        import("playwright").Locator |
        undefined;

      let editorScore =
        Number.NEGATIVE_INFINITY;

      for (
        let attempt = 1;
        attempt <= 20 && !editor;
        attempt++
      ) {

        const candidates =
          this.human.page.locator(
            'textarea, [role="textbox"], [contenteditable]:not([contenteditable="false"])'
          );

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
              (el: HTMLElement) => {

                const aria =
                  (
                    el.getAttribute(
                      "aria-label"
                    ) ?? ""
                  ).toLowerCase();

                const placeholder =
                  (
                    el.getAttribute(
                      "placeholder"
                    ) ?? ""
                  ).toLowerCase();

                const role =
                  (
                    el.getAttribute(
                      "role"
                    ) ?? ""
                  ).toLowerCase();

                const contenteditable =
                  (
                    el.getAttribute(
                      "contenteditable"
                    ) ?? ""
                  ).toLowerCase();

                const dataPlaceholder =
                  (
                    el.getAttribute(
                      "data-placeholder"
                    ) ?? ""
                  ).toLowerCase();

                const text =
                  (
                    el.textContent ?? ""
                  )
                    .trim()
                    .toLowerCase()
                    .slice(0, 200);

                const inDialog =
                  Boolean(
                    el.closest(
                      '[role="dialog"], .artdeco-modal, [data-test-modal]'
                    )
                  );

                const tag =
                  el.tagName
                    .toLowerCase();

                return {
                  aria,
                  placeholder,
                  role,
                  contenteditable,
                  dataPlaceholder,
                  text,
                  inDialog,
                  tag
                };
              }
            );

          const description =
            [
              info.aria,
              info.placeholder,
              info.dataPlaceholder,
              info.text
            ]
              .join(" ")
              .toLowerCase();

          /*
           * Search inputs and unrelated navigation textboxes
           * must never win.
           */
          if (
            /search|message search|global search|jobs search/.test(
              description
            )
          ) {
            continue;
          }

          let score = 0;

          if (info.inDialog) {
            score += 120;
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
            info.role ===
            "textbox"
          ) {
            score += 60;
          }

          if (
            info.tag ===
            "textarea"
          ) {
            score += 35;
          }

          if (
            /post|share|editor|talk about|what do you want|write/.test(
              description
            )
          ) {
            score += 80;
          }

          if (
            /comment|reply|message|search/.test(
              description
            )
          ) {
            score -= 100;
          }

          if (
            score >
            editorScore
          ) {
            editor =
              candidate;

            editorScore =
              score;
          }
        }

        /*
         * A feed textbox can exist before the composer is ready.
         * Require a strong semantic match instead of grabbing it.
         */
        if (
          editor &&
          editorScore >= 100
        ) {
          break;
        }

        editor =
          undefined;

        editorScore =
          Number.NEGATIVE_INFINITY;

        await this.human.page
          .waitForTimeout(500);
      }

      if (!editor) {

        const diagnostics =
          await this.human.page
            .locator(
              'textarea, [role="textbox"], [contenteditable]'
            )
            .evaluateAll(
              elements =>
                elements
                  .slice(0, 40)
                  .map(el => ({
                    tag:
                      el.tagName,
                    role:
                      el.getAttribute(
                        "role"
                      ),
                    aria:
                      el.getAttribute(
                        "aria-label"
                      ),
                    placeholder:
                      el.getAttribute(
                        "placeholder"
                      ),
                    contenteditable:
                      el.getAttribute(
                        "contenteditable"
                      ),
                    visible:
                      (el as HTMLElement)
                        .offsetParent !== null
                  }))
            )
            .catch(() => []);

        console.log(
          "LINKEDIN_EDITOR_DIAGNOSTICS",
          diagnostics
        );

        throw new Error(
          "LinkedIn composer opened but no valid live post editor could be resolved."
        );
      }

      console.log(
        `LinkedIn live editor resolved dynamically. score=${editorScore}`
      );

      await editor
        .scrollIntoViewIfNeeded();

      await this.human.page
        .waitForTimeout(400);

      await editor.click();

      await this.human.page
        .waitForTimeout(300);

      await editor.fill(
        postText
      );

      await this.human.page
        .waitForTimeout(700);

      /*
       * Verify actual editor state before attempting Post.
       */
      const enteredText =
        await editor.evaluate(
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

      const normalizeEditorText =
        (value: string) =>
          value
            .replace(/\s+/g, " ")
            .trim();

      if (
        !normalizeEditorText(
          enteredText
        ).includes(
          normalizeEditorText(
            postText
          )
        )
      ) {
        throw new Error(
          "LinkedIn editor was resolved but entered text could not be verified."
        );
      }

      console.log(
        "LinkedIn post editor filled and verified."
      );
    }

    if (options.images?.length) {

      await this.human.upload(
        'input[type="file"]',
        options.images
      );

    }

    if (options.videos?.length) {

      await this.human.upload(
        'input[type="file"]',
        options.videos
      );

    }

    const publishCandidates = [
      this.human.page.getByRole(
        "button",
        {
          name: /^Post$/i
        }
      ),
      this.human.page.getByRole(
        "button",
        {
          name: /^Publish$/i
        }
      ),
      this.human.page.locator(
        '[data-view-name*="post"][role="button"]'
      )
    ];

    let publishButton:
      import("playwright").Locator |
      undefined;

    for (
      const candidate
      of publishCandidates
    ) {
      const first =
        candidate.first();

      if (
        (await first.count()) > 0 &&
        await first
          .isVisible()
          .catch(() => false)
      ) {
        publishButton = first;
        break;
      }
    }

    if (!publishButton) {
      throw new Error(
        "LinkedIn publish button not found."
      );
    }

    if (
      await publishButton
        .isDisabled()
        .catch(() => false)
    ) {
      throw new Error(
        "LinkedIn publish button is disabled."
      );
    }

    await publishButton
      .scrollIntoViewIfNeeded();

    await this.human.page
      .waitForTimeout(650);

    await publishButton.click();

    await this.human.page
      .waitForTimeout(2500);

    if (!postText) {
      throw new Error(
        "LinkedIn post verification requires text."
      );
    }

    const normalize = (
      value: string
    ): string =>
      value
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const expected =
      normalize(postText);

    /*
     * LinkedIn's current feed DOM no longer reliably uses
     * div.feed-shared-update-v2. Verify the newly published
     * text directly on the live feed first, but only after
     * the composer/editor has disappeared.
     */
    for (
      let attempt = 0;
      attempt < 5;
      attempt++
    ) {
      const composerStillOpen =
        await this.human.page
          .locator(
            [
              '[contenteditable="true"][role="textbox"]',
              '[contenteditable="true"]',
              '[role="textbox"]',
              'textarea'
            ].join(",")
          )
          .evaluateAll(elements =>
            elements.filter(element => {
              const style =
                window.getComputedStyle(element);

              const rect =
                element.getBoundingClientRect();

              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                rect.width > 0 &&
                rect.height > 0
              );
            }).length
          )
          .catch(() => 0);

      const bodyText =
        normalize(
          await this.human.page
            .locator("body")
            .innerText()
            .catch(() => "")
        );

      if (
        composerStillOpen === 0 &&
        bodyText.includes(expected)
      ) {
        return {
          verified: true
        };
      }

      await this.human.page
        .waitForTimeout(1000);
    }

    const verifyCurrentPage =
      async (): Promise<{
        verified: boolean;
        postUrn?: string;
        postUrl?: string;
      } | undefined> => {

        const posts =
          this.human.page.locator(
            "div.feed-shared-update-v2"
          );

        const count =
          await posts.count();

        for (
          let i = 0;
          i < Math.min(count, 20);
          i++
        ) {

          const post =
            posts.nth(i);

          const text =
            normalize(
              await post
                .innerText()
                .catch(() => "")
            );

          if (
            !text ||
            !text.includes(expected)
          ) {
            continue;
          }

          const postUrn =
            (
              await post.getAttribute(
                "data-urn"
              )
            ) ?? undefined;

          const link =
            post.locator(
              'a[href*="/feed/update/"], a[href*="/posts/"]'
            ).first();

          const href =
            (await link.count()) > 0
              ? await link.getAttribute(
                  "href"
                )
              : null;

          const postUrl =
            href
              ? new URL(
                  href,
                  "https://www.linkedin.com"
                ).toString()
              : postUrn
                ? (
                    "https://www.linkedin.com/feed/update/" +
                    postUrn
                  )
                : undefined;

          return {
            verified: true,
            postUrn,
            postUrl
          };

        }

        return undefined;
      };

    /*
     * Give LinkedIn time to finish publishing
     * and render the new post naturally.
     */
    for (
      let attempt = 0;
      attempt < 5;
      attempt++
    ) {

      await this.human.page.waitForTimeout(
        attempt === 0
          ? 3500
          : 2500
      );

      const result =
        await verifyCurrentPage();

      if (result) {
        return result;
      }

    }

    /*
     * The home feed can lag, so verify against
     * the authenticated account's own activity.
     */
    await this.human.goto(
      "https://www.linkedin.com/in/me/recent-activity/all/"
    );

    await this.human.page.waitForTimeout(
      3500
    );

    for (
      let attempt = 0;
      attempt < 5;
      attempt++
    ) {

      const result =
        await verifyCurrentPage();

      if (result) {
        return result;
      }

      await this.human.page.waitForTimeout(
        2500
      );

    }

    throw new Error(
      "LinkedIn publish verification failed: newly published post was not found on feed or recent activity."
    );

  }

}
