import { HumanBrowser } from "@ai-os/browser-runtime";

export interface LinkedInMessage {
  id: string;
  sender: string;
  text: string;
  timestamp?: string;
}

export interface LinkedInTargetedSendRequest {
  recipient: string;
  text: string;
  company?: string;
  profileUrl?: string;
  inviteText?: string;
  dryRun?: boolean;
}

export interface LinkedInTargetedSendResult {
  success: boolean;
  recipient: string;
  company?: string;
  conversationVerified: boolean;
  messageVerified: boolean;
  dryRun: boolean;
  deliveryMode?: "message" | "invite" | "email";
  publicEmail?: string;
}

export class LinkedInMessaging {

  private cursor = 0;
  private lastPublicContactEmail?: string;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  private get page(): any {
    return (this.human as any).page;
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  async open(): Promise<void> {

    await this.human.goto(
      "https://www.linkedin.com/messaging/"
    );

    await this.page.waitForTimeout(1800);

    const url = this.page.url();

    if (
      /\/login|\/checkpoint|\/challenge/i.test(url)
    ) {
      throw new Error(
        `LinkedIn authentication required: ${url}`
      );
    }
  }

  async list(): Promise<LinkedInMessage[]> {

    await this.open();

    return await this.human.evaluate(() =>
      Array.from(
        document.querySelectorAll("[role=listitem]")
      ).map((e:any)=>({
        id:e.innerText,
        sender:e.innerText,
        text:"",
        timestamp:""
      }))
    );
  }

  async read(): Promise<string[]> {

    return await this.human.evaluate(() =>
      Array.from(
        document.querySelectorAll("[data-event-urn]")
      ).map((e:any)=>e.innerText)
    );
  }

  private async resolveSearchInput(): Promise<any> {

    const page = this.page;

    for (let attempt = 0; attempt < 20; attempt++) {

      const candidates = page.locator(
        [
          'input[placeholder*="Search messages" i]',
          'input[aria-label*="Search messages" i]',
          'input[placeholder*="Search" i]',
          'input[aria-label*="Search" i]',
          '[role="searchbox"]',
          'input[type="search"]'
        ].join(",")
      );

      const count = Math.min(
        await candidates.count(),
        50
      );

      let best: any = null;
      let bestScore = -1;

      for (let i = 0; i < count; i++) {

        const candidate = candidates.nth(i);

        if (!(await candidate.isVisible().catch(() => false)))
          continue;

        if (!(await candidate.isEnabled().catch(() => false)))
          continue;

        const meta = await candidate.evaluate(
          (el:any) => ({
            aria: el.getAttribute("aria-label") || "",
            placeholder: el.getAttribute("placeholder") || "",
            role: el.getAttribute("role") || "",
            type: el.getAttribute("type") || ""
          })
        );

        const haystack =
          `${meta.aria} ${meta.placeholder} ${meta.role} ${meta.type}`
            .toLowerCase();

        let score = 0;

        if (/search messages/.test(haystack))
          score += 300;

        if (/search/.test(haystack))
          score += 120;

        if (/searchbox/.test(haystack))
          score += 80;

        if (/message/.test(haystack))
          score += 80;

        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }

      if (best && bestScore >= 100) {

        console.log(
          `LinkedIn messaging search resolved dynamically. score=${bestScore}`
        );

        return best;
      }

      await page.waitForTimeout(400);
    }

    throw new Error(
      "LinkedIn messaging search input could not be resolved."
    );
  }

  private async dismissBlockingLinkedInOverlay(): Promise<void> {

    const page = this.page;

    const blocking = page.locator(
      '#interop-outlet, [role="dialog"], [aria-modal="true"]'
    );

    const count =
      Math.min(
        await blocking.count(),
        20
      );

    for (let i = 0; i < count; i++) {

      const el =
        blocking.nth(i);

      if (!(await el.isVisible().catch(() => false)))
        continue;

      const text =
        this.normalize(
          await el.innerText().catch(() => "")
        );

      if (
        text.includes("my apps") &&
        text.includes("explore more for business")
      ) {

        console.log(
          "LinkedIn unrelated My Apps overlay detected; dismissing before profile action."
        );

        await page.keyboard.press("Escape");
        await page.waitForTimeout(450);

        if (await el.isVisible().catch(() => false)) {

          const close = el.locator(
            'button[aria-label*="close" i], button[aria-label*="dismiss" i]'
          ).first();

          if (
            await close.count() &&
            await close.isVisible().catch(() => false)
          ) {
            await close.click({ force: true });
            await page.waitForTimeout(400);
          }
        }
      }
    }
  }

  private async openProfileConversation(
    recipient: string,
    profileUrl: string,
    company?: string
  ): Promise<"message" | "invite" | "email"> {

    const page = this.page;

    const norm = (value: unknown) =>
      String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const expectedName =
      norm(recipient);

    const expectedCompany =
      norm(company);

    const rawUrl =
      String(profileUrl || "");

    const slug =
      rawUrl.match(
        /linkedin\.com\/in\/([A-Za-z0-9_-]+)/i
      )?.[1];

    if (!slug) {
      throw new Error(
        `LinkedIn profile URL invalid for ${recipient}.`
      );
    }

    const canonicalUrl =
      `https://www.linkedin.com/in/${slug}/`;

    await this.human.goto(
      canonicalUrl
    );

    await page.waitForTimeout(
      1800
    );

    if (
      /\/login|\/checkpoint|\/challenge/i.test(
        page.url()
      )
    ) {
      throw new Error(
        `LinkedIn authentication required: ${page.url()}`
      );
    }

    const bodyText =
      norm(
        await page
          .locator("body")
          .innerText()
      );

    if (
      !bodyText.includes(
        expectedName
      )
    ) {
      throw new Error(
        `LinkedIn prospect verification failed: ${recipient}.`
      );
    }

    if (
      expectedCompany &&
      !bodyText.includes(
        expectedCompany
      )
    ) {
      throw new Error(
        `LinkedIn current-company verification failed: ${recipient} | ${company}.`
      );
    }

    console.log(
      `LinkedIn VERIFIED_PROFILE=${recipient} | ${company || ""}`
    );

    // ========================================================
    // Remove only unrelated overlays.
    // ========================================================

    const dismissUnrelated =
      async () => {

        const overlays =
          page.locator(
            [
              "#interop-outlet",
              '[role="dialog"]',
              '[aria-modal="true"]',
              ".artdeco-modal"
            ].join(",")
          );

        const count =
          Math.min(
            await overlays.count(),
            25
          );

        for (
          let i = 0;
          i < count;
          i++
        ) {

          const overlay =
            overlays.nth(i);

          if (
            !(await overlay
              .isVisible()
              .catch(() => false))
          ) {
            continue;
          }

          const text =
            norm(
              await overlay
                .innerText()
                .catch(() => "")
            );

          if (
            !(
              text.includes("my apps") ||
              text.includes(
                "explore more for business"
              ) ||
              text.includes(
                "close deals with sales nav"
              )
            )
          ) {
            continue;
          }

          const closeButtons =
            overlay.locator(
              'button, [role="button"]'
            );

          let closed = false;

          for (
            let j = 0;
            j <
              Math.min(
                await closeButtons.count(),
                40
              );
            j++
          ) {

            const button =
              closeButtons.nth(j);

            if (
              !(await button
                .isVisible()
                .catch(() => false))
            ) {
              continue;
            }

            const label =
              norm(
                `${
                  await button
                    .innerText()
                    .catch(() => "")
                } ${
                  await button
                    .getAttribute(
                      "aria-label"
                    )
                    .catch(() => "")
                }`
              );

            if (
              label === "close" ||
              label.includes(
                "close modal"
              ) ||
              label === "dismiss"
            ) {

              await button.evaluate(
                (node: any) =>
                  node.click()
              );

              closed = true;

              break;
            }
          }

          if (!closed) {
            await page.keyboard.press(
              "Escape"
            );
          }

          await page.waitForTimeout(
            350
          );
        }
      };

    await dismissUnrelated();

    // ========================================================
    // Inspect the LIVE visible profile controls.
    //
    // Crucial rule:
    // an element only qualifies when its nearby visual container
    // contains BOTH the verified prospect name and company.
    // Global nav and interop controls are rejected.
    // ========================================================

    const discoverActions =
      async () => {

        return await page.evaluate(
          ({
            expectedName,
            expectedCompany
          }: {
            expectedName: string;
            expectedCompany: string;
          }) => {

            const norm = (
              value: unknown
            ) =>
              String(value || "")
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

            const visible = (
              element: Element
            ) => {

              const node =
                element as HTMLElement;

              const rect =
                node.getBoundingClientRect();

              const style =
                window.getComputedStyle(
                  node
                );

              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !==
                  "none" &&
                style.visibility !==
                  "hidden" &&
                Number(
                  style.opacity || "1"
                ) !== 0
              );
            };

            const all =
              Array.from(
                document.querySelectorAll(
                  [
                    "main button",
                    'main a[role="button"]',
                    'main [role="button"]',
                    'main a'
                  ].join(",")
                )
              );

            const results: any[] =
              [];

            for (
              const element of all
            ) {

              if (!visible(element))
                continue;

              if (
                element.closest(
                  [
                    "#interop-outlet",
                    "header",
                    "nav",
                    ".global-nav",
                    '[class*="global-nav"]'
                  ].join(",")
                )
              ) {
                continue;
              }

              const node =
                element as HTMLElement;

              const text =
                norm(
                  [
                    node.innerText,
                    node.textContent,
                    element.getAttribute(
                      "aria-label"
                    ),
                    element.getAttribute(
                      "title"
                    )
                  ].join(" ")
                );

              if (!text)
                continue;

              let parent:
                Element | null =
                  element;

              let context = "";

              for (
                let depth = 0;
                depth < 9 &&
                parent;
                depth++
              ) {

                const candidate =
                  norm(
                    (
                      parent as HTMLElement
                    ).innerText ||
                    parent.textContent ||
                    ""
                  );

                if (
                  candidate.length >
                    20 &&
                  candidate.length <
                    1800 &&
                  candidate.includes(
                    expectedName
                  ) &&
                  (
                    !expectedCompany ||
                    candidate.includes(
                      expectedCompany
                    )
                  )
                ) {

                  context =
                    candidate;

                  break;
                }

                parent =
                  parent.parentElement;
              }

              if (!context)
                continue;

              const rect =
                node.getBoundingClientRect();

              // Profile primary action area should
              // live near the top of the profile.
              if (
                rect.top < -50 ||
                rect.top > 950
              ) {
                continue;
              }

              let type:
                | "message"
                | "connect"
                | "follow"
                | "more"
                | "contact"
                | null =
                  null;

              if (
                text === "message" ||
                /^message\b/.test(
                  text
                ) ||
                /send .* a message/.test(
                  text
                )
              ) {
                type =
                  "message";
              }

              else if (
                text === "connect" ||
                /^connect\b/.test(
                  text
                ) ||
                /invite .* to connect/.test(
                  text
                ) ||
                /connect with /.test(
                  text
                )
              ) {
                type =
                  "connect";
              }

              else if (
                text === "follow" ||
                /^follow\b/.test(
                  text
                )
              ) {
                type =
                  "follow";
              }

              else if (
                text === "more" ||
                /^more actions/.test(
                  text
                )
              ) {
                type =
                  "more";
              }

              else if (
                text.includes(
                  "contact info"
                )
              ) {
                type =
                  "contact";
              }

              if (!type)
                continue;

              results.push({
                type,
                text,
                x: rect.x,
                y: rect.y,
                width:
                  rect.width,
                height:
                  rect.height
              });
            }

            return results;
          },
          {
            expectedName,
            expectedCompany
          }
        );
      };

    const actions =
      await discoverActions();

    console.log(
      "LinkedIn LIVE_PROFILE_ACTIONS=" +
      JSON.stringify(actions)
    );

    // ========================================================
    // Resolve an action again from the live DOM at click time.
    // Never reuse stale handles after modal/menu transitions.
    // ========================================================

    const resolveAction =
      async (
        wanted:
          | "message"
          | "connect"
          | "follow"
          | "more"
          | "contact"
      ): Promise<any | null> => {

        const candidates =
          page.locator(
            [
              "main button",
              'main a[role="button"]',
              'main [role="button"]',
              "main a"
            ].join(",")
          );

        const count =
          Math.min(
            await candidates.count(),
            300
          );

        let best:any =
          null;

        let bestScore =
          -1;

        for (
          let i = 0;
          i < count;
          i++
        ) {

          const el =
            candidates.nth(i);

          if (
            !(await el
              .isVisible()
              .catch(() => false))
          ) {
            continue;
          }

          const info =
            await el.evaluate(
              (
                node: any,
                args: {
                  expectedName: string;
                  expectedCompany: string;
                  wanted: string;
                }
              ) => {

                const norm = (
                  value: unknown
                ) =>
                  String(
                    value || ""
                  )
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .trim()
                    .toLowerCase();

                if (
                  node.closest(
                    [
                      "#interop-outlet",
                      "header",
                      "nav",
                      ".global-nav",
                      '[class*="global-nav"]'
                    ].join(",")
                  )
                ) {
                  return {
                    score: -1,
                    text: ""
                  };
                }

                const text =
                  norm(
                    [
                      node.innerText,
                      node.textContent,
                      node.getAttribute(
                        "aria-label"
                      ),
                      node.getAttribute(
                        "title"
                      )
                    ].join(" ")
                  );

                let contextOK =
                  false;

                let parent:
                  any =
                    node;

                for (
                  let depth = 0;
                  depth < 9 &&
                  parent;
                  depth++
                ) {

                  const textAround =
                    norm(
                      parent.innerText ||
                      parent.textContent ||
                      ""
                    );

                  if (
                    textAround.includes(
                      args.expectedName
                    ) &&
                    (
                      !args.expectedCompany ||
                      textAround.includes(
                        args.expectedCompany
                      )
                    ) &&
                    textAround.length <
                      1800
                  ) {

                    contextOK =
                      true;

                    break;
                  }

                  parent =
                    parent.parentElement;
                }

                if (!contextOK) {
                  return {
                    score: -1,
                    text
                  };
                }

                const rect =
                  node.getBoundingClientRect();

                if (
                  rect.width <= 0 ||
                  rect.height <= 0 ||
                  rect.top < -50 ||
                  rect.top > 950
                ) {
                  return {
                    score: -1,
                    text
                  };
                }

                let score =
                  -1;

                if (
                  args.wanted ===
                    "message"
                ) {

                  if (
                    text ===
                    "message"
                  )
                    score =
                      3000;

                  else if (
                    /^message\b/.test(
                      text
                    )
                  )
                    score =
                      2700;

                  else if (
                    /send .* a message/.test(
                      text
                    )
                  )
                    score =
                      2500;
                }

                if (
                  args.wanted ===
                    "connect"
                ) {

                  if (
                    text ===
                    "connect"
                  )
                    score =
                      3000;

                  else if (
                    /^connect\b/.test(
                      text
                    )
                  )
                    score =
                      2800;

                  else if (
                    /invite .* to connect/.test(
                      text
                    )
                  )
                    score =
                      2800;

                  else if (
                    /connect with /.test(
                      text
                    )
                  )
                    score =
                      2700;
                }

                if (
                  args.wanted ===
                    "more"
                ) {

                  if (
                    text === "more"
                  )
                    score =
                      3000;

                  else if (
                    /^more actions/.test(
                      text
                    )
                  )
                    score =
                      2800;
                }

                if (
                  args.wanted ===
                    "follow"
                ) {

                  if (
                    text === "follow"
                  )
                    score =
                      3000;

                  else if (
                    /^follow\b/.test(
                      text
                    )
                  )
                    score =
                      2700;
                }

                if (
                  args.wanted ===
                    "contact"
                ) {

                  if (
                    text.includes(
                      "contact info"
                    )
                  )
                    score =
                      3000;
                }

                return {
                  score,
                  text
                };
              },
              {
                expectedName,
                expectedCompany,
                wanted
              }
            );

          if (
            info.score >
            bestScore
          ) {

            best =
              el;

            bestScore =
              info.score;
          }
        }

        if (
          !best ||
          bestScore < 2500
        ) {
          return null;
        }

        console.log(
          `LinkedIn VERIFIED_ACTION=${wanted} score=${bestScore}`
        );

        return best;
      };

    // ========================================================
    // Detect relationship.
    // ========================================================

    const firstDegree =
      /(?:^|\s)1st(?:\s|$|•)/i.test(
        bodyText
      );

    // ========================================================
    // Helper: look for Connect under More.
    // ========================================================


    const connectDialogVisible =
      async (): Promise<boolean> => {
        const dialogs =
          page.locator(
            [
              '[role="dialog"]',
              '[aria-modal="true"]',
              ".artdeco-modal"
            ].join(",")
          );

        for (
          let attempt = 0;
          attempt < 12;
          attempt++
        ) {
          const count =
            Math.min(
              await dialogs.count(),
              30
            );

          for (
            let i = 0;
            i < count;
            i++
          ) {
            const dialog =
              dialogs.nth(i);

            if (
              !(await dialog
                .isVisible()
                .catch(() => false))
            ) {
              continue;
            }

            const text =
              norm(
                await dialog
                  .innerText()
                  .catch(() => "")
              );

            if (
              /add a note|send without a note|send invitation|invitation to connect|personalize.*invite/i.test(
                text
              )
            ) {
              return true;
            }
          }

          await page.waitForTimeout(
            250
          );
        }

        return false;
      };

    const clickVerifiedConnect =
      async (
        route:
          | "DIRECT_CONNECT"
          | "CONNECT_AFTER_INMAIL"
      ): Promise<boolean> => {
        for (
          let attempt = 0;
          attempt < 3;
          attempt++
        ) {
          const connect =
            await resolveAction(
              "connect"
            );

          if (!connect) {
            return false;
          }

          try {
            await connect
              .scrollIntoViewIfNeeded()
              .catch(() => {});

            await page.waitForTimeout(
              250 + attempt * 150
            );

            await connect.click({
              timeout: 2500
            });
          } catch {
            try {
              await connect.evaluate(
                (node: any) =>
                  node.click()
              );
            } catch {
              await page.waitForTimeout(
                350
              );
              continue;
            }
          }

          if (
            await connectDialogVisible()
          ) {
            console.log(
              `LinkedIn ROUTE=${route}`
            );
            console.log(
              `LinkedIn CONNECT_TRANSITION_VERIFIED=true attempt=${attempt + 1}`
            );

            return true;
          }

          console.log(
            `LinkedIn CONNECT_TRANSITION_RETRY=${route} attempt=${attempt + 1}`
          );

          await page.keyboard
            .press("Escape")
            .catch(() => {});

          await page.waitForTimeout(
            400 + attempt * 200
          );
        }

        return false;
      };

    const connectThroughMore =
      async (): Promise<boolean> => {

        const more =
          await resolveAction(
            "more"
          );

        if (!more)
          return false;

        await more.evaluate(
          (node: any) =>
            node.click()
        );

        await page.waitForTimeout(
          400
        );

        const menuItems =
          page.locator(
            [
              '[role="menu"] [role="menuitem"]',
              '[role="menu"] button',
              '.artdeco-dropdown__content [role="menuitem"]',
              '.artdeco-dropdown__content button'
            ].join(",")
          );

        const count =
          Math.min(
            await menuItems.count(),
            100
          );

        for (
          let i = 0;
          i < count;
          i++
        ) {

          const item =
            menuItems.nth(i);

          if (
            !(await item
              .isVisible()
              .catch(() => false))
          ) {
            continue;
          }

          const label =
            norm(
              `${
                await item
                  .innerText()
                  .catch(() => "")
              } ${
                await item
                  .getAttribute(
                    "aria-label"
                  )
                  .catch(() => "")
              }`
            );

          if (
            label === "connect" ||
            /^connect with /.test(
              label
            ) ||
            /invite .* to connect/.test(
              label
            )
          ) {

            await item.evaluate(
              (node: any) =>
                node.click()
            );

            await page.waitForTimeout(
              600
            );

            console.log(
              "LinkedIn ROUTE=MORE_CONNECT"
            );

            return true;
          }
        }

        await page.keyboard.press(
          "Escape"
        );

        return false;
      };

    // ========================================================
    // Helper: detect a real DM composer after Message.
    // ========================================================

    const realComposerVisible =
      async () => {

        const composer =
          page.locator(
            [
              '.msg-form__contenteditable[contenteditable="true"]',
              '.msg-form [contenteditable="true"]',
              '.msg-overlay-conversation-bubble [contenteditable="true"]',
              '[role="dialog"] [contenteditable="true"]',
              '[aria-modal="true"] [contenteditable="true"]',
              'div[contenteditable="true"][role="textbox"]'
            ].join(",")
          );

        for (
          let attempt = 0;
          attempt < 8;
          attempt++
        ) {

          const count =
            Math.min(
              await composer.count(),
              50
            );

          for (
            let i = 0;
            i < count;
            i++
          ) {

            if (
              await composer
                .nth(i)
                .isVisible()
                .catch(
                  () => false
                )
            ) {
              return true;
            }
          }

          await page.waitForTimeout(
            250
          );
        }

        return false;
      };

    // ========================================================
    // FIRST-DEGREE:
    // direct Message is the correct route.
    // ========================================================

    if (firstDegree) {

      const message =
        await resolveAction(
          "message"
        );

      if (message) {

        await message.evaluate(
          (node: any) =>
            node.click()
        );

        await page.waitForTimeout(
          700
        );

        if (
          await realComposerVisible()
        ) {

          console.log(
            "LinkedIn ROUTE=DIRECT_MESSAGE"
          );

          return "message";
        }
      }
    }

    // ========================================================
    // NON-FIRST DEGREE:
    // prefer Connect because Message frequently means InMail.
    // ========================================================

    const directConnect =
      await resolveAction(
        "connect"
      );

    if (
      directConnect &&
      await clickVerifiedConnect(
        "DIRECT_CONNECT"
      )
    ) {
      return "invite";
    }

    if (
      await connectThroughMore()
    ) {
      return "invite";
    }

    // ========================================================
    // No visible Connect:
    // try Message, but only accept it when a real composer opens.
    // ========================================================

    const message =
      await resolveAction(
        "message"
      );

    if (message) {

      await message.evaluate(
        (node: any) =>
          node.click()
      );

      await page.waitForTimeout(
        650
      );

      if (
        await realComposerVisible()
      ) {

        console.log(
          "LinkedIn ROUTE=MESSAGE_COMPOSER"
        );

        return "message";
      }

      const upsell =
        page.locator(
          [
            '[role="dialog"]',
            '[aria-modal="true"]',
            ".artdeco-modal"
          ].join(",")
        )
        .filter({
          hasText:
            /Sales Nav|Sales Navigator|InMail|close deals/i
        })
        .first();

      if (
        await upsell.count() &&
        await upsell
          .isVisible()
          .catch(() => false)
      ) {

        console.log(
          "LinkedIn MESSAGE_IS_INMAIL_UPSELL=true"
        );

        await page.keyboard.press(
          "Escape"
        );

        await page.waitForTimeout(
          350
        );

        // LinkedIn sometimes changes available actions
        // after the InMail modal closes.
        const connectAfterUpsell =
          await resolveAction(
            "connect"
          );

        if (
          connectAfterUpsell &&
          await clickVerifiedConnect(
            "CONNECT_AFTER_INMAIL"
          )
        ) {
          return "invite";
        }

        if (
          await connectThroughMore()
        ) {
          return "invite";
        }
      }
    }

    // ========================================================
    // FOLLOW is allowed as a supporting action only.
    // It NEVER counts as outreach completion.
    // ========================================================

    const follow =
      await resolveAction(
        "follow"
      );

    if (follow) {

      console.log(
        "LinkedIn FOLLOW_AVAILABLE_SUPPORTING_ONLY=true"
      );
    }

    // ========================================================
    // CONTACT INFO FALLBACK.
    // Look only for a public email actually exposed by LinkedIn.
    // ========================================================

    const contact =
      await resolveAction(
        "contact"
      );

    if (contact) {

      await contact.evaluate(
        (node: any) =>
          node.click()
      );

      await page.waitForTimeout(
        500
      );

      const dialogs =
        page.locator(
          [
            '[role="dialog"]',
            '[aria-modal="true"]',
            ".artdeco-modal"
          ].join(",")
        );

      const count =
        Math.min(
          await dialogs.count(),
          20
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const dialog =
          dialogs.nth(i);

        if (
          !(await dialog
            .isVisible()
            .catch(() => false))
        ) {
          continue;
        }

        const text =
          await dialog
            .innerText()
            .catch(() => "");

        const email =
          String(text)
            .match(
              /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
            )?.[0];

        if (email) {

          this.lastPublicContactEmail = email;

          console.log(
            `LinkedIn PUBLIC_CONTACT_EMAIL=${email}`
          );

          return "email";
        }
      }

      await page.keyboard.press(
        "Escape"
      );
    }

    throw new Error(
      `LinkedIn exhausted all verified outreach routes for ${recipient}: no DM composer, no Connect action, no Connect-under-More, and no public email.`
    );
  }

  private async sendInviteNote(
    recipient: string,
    text: string
  ): Promise<void> {

    const page = this.page;

    const note =
      String(text || "")
        .trim();

    if (!note) {
      throw new Error(
        "LinkedIn invitation note is empty."
      );
    }

    const finalNote =
      note.length <= 200
        ? note
        : note
            .slice(0, 197)
            .replace(/\s+\S*$/, "")
            .trimEnd() + "...";

    if (finalNote !== note) {
      console.log(
        `LinkedIn invitation note automatically fitted to ${finalNote.length} characters.`
      );
    }

    await page.waitForTimeout(
      450
    );

    // --------------------------------------------------------
    // Connect modal may initially show "Add a note".
    // --------------------------------------------------------

    const visibleDialogs =
      page.locator(
        [
          '[role="dialog"]',
          '[aria-modal="true"]',
          ".artdeco-modal"
        ].join(",")
      );

    const dialogCount =
      Math.min(
        await visibleDialogs.count(),
        30
      );

    let connectDialog:any = null;

    for (
      let i = 0;
      i < dialogCount;
      i++
    ) {

      const dialog =
        visibleDialogs.nth(i);

      if (
        !(await dialog
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const dialogText =
        this.normalize(
          await dialog
            .innerText()
            .catch(() => "")
        );

      if (
        /invite|connect|add a note/i.test(
          dialogText
        )
      ) {
        connectDialog =
          dialog;
        break;
      }
    }

    if (!connectDialog) {
      throw new Error(
        `LinkedIn Connect dialog did not appear for ${recipient}.`
      );
    }

    const addButtons =
      connectDialog.locator(
        'button, [role="button"]'
      );

    const addCount =
      Math.min(
        await addButtons.count(),
        80
      );

    let addNote:any = null;

    for (
      let i = 0;
      i < addCount;
      i++
    ) {

      const el =
        addButtons.nth(i);

      if (
        !(await el
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const label =
        this.normalize(
          `${
            await el
              .innerText()
              .catch(() => "")
          } ${
            await el
              .getAttribute("aria-label")
              .catch(() => "")
          }`
        );

      if (
        /add a note|personalize.*invite/i.test(
          label
        )
      ) {
        addNote = el;
        break;
      }
    }

    if (addNote) {

      await addNote.evaluate(
        (node:any) =>
          node.click()
      );

      await page.waitForTimeout(
        450
      );
    }

    // --------------------------------------------------------
    // Resolve live note editor AFTER modal transition.
    // --------------------------------------------------------

    const editorCandidates =
      page.locator(
        [
          '[role="dialog"] textarea',
          '[aria-modal="true"] textarea',
          '.artdeco-modal textarea',
          '[role="dialog"] [role="textbox"]',
          '[aria-modal="true"] [role="textbox"]',
          '[role="dialog"] [contenteditable="true"]'
        ].join(",")
      );

    let editor:any = null;

    for (
      let attempt = 0;
      attempt < 12;
      attempt++
    ) {

      const count =
        Math.min(
          await editorCandidates.count(),
          40
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const el =
          editorCandidates.nth(i);

        if (
          await el
            .isVisible()
            .catch(() => false)
        ) {
          editor = el;
          break;
        }
      }

      if (editor)
        break;

      await page.waitForTimeout(
        300
      );
    }

    if (!editor) {
      throw new Error(
        "LinkedIn live invitation note editor could not be resolved."
      );
    }

    await editor.fill(finalNote);

    const actual =
      await editor.evaluate(
        (node:any) =>
          "value" in node
            ? node.value
            : (
                node.innerText ||
                node.textContent ||
                ""
              )
      );

    if (
      this.normalize(
        String(actual)
      ) !==
      this.normalize(finalNote)
    ) {
      throw new Error(
        "LinkedIn invitation note text verification failed."
      );
    }

    console.log(
      "LinkedIn invitation note filled and verified."
    );

    // --------------------------------------------------------
    // Re-resolve the CURRENT live modal after Add-note transition.
    // Never reuse stale dialog handles.
    // --------------------------------------------------------

    const finalDialogs =
      page.locator(
        [
          '[role="dialog"]',
          '[aria-modal="true"]',
          ".artdeco-modal"
        ].join(",")
      );

    const finalCount =
      Math.min(
        await finalDialogs.count(),
        30
      );

    let noteDialog:any = null;

    for (
      let i = 0;
      i < finalCount;
      i++
    ) {

      const dialog =
        finalDialogs.nth(i);

      if (
        !(await dialog
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      const text =
        this.normalize(
          await dialog
            .innerText()
            .catch(() => "")
        );

      if (
        /add a note|invitation|send/i.test(
          text
        )
      ) {
        noteDialog =
          dialog;
        break;
      }
    }

    if (!noteDialog) {
      throw new Error(
        "LinkedIn invitation modal disappeared before Send."
      );
    }

    const buttons =
      noteDialog.locator(
        'button, [role="button"]'
      );

    const count =
      Math.min(
        await buttons.count(),
        100
      );

    let send:any = null;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const el =
        buttons.nth(i);

      if (
        !(await el
          .isVisible()
          .catch(() => false))
      ) {
        continue;
      }

      if (
        !(await el
          .isEnabled()
          .catch(() => false))
      ) {
        continue;
      }

      const buttonText =
        this.normalize(
          await el
            .innerText()
            .catch(() => "")
        );

      const ariaLabel =
        this.normalize(
          await el
            .getAttribute("aria-label")
            .catch(() => "")
        );

      /*
       * LinkedIn frequently exposes the same semantic label in
       * both visible text and aria-label. Never concatenate them
       * and then exact-match, because a real button can become:
       *
       *   "send send invitation"
       *
       * Resolve each source independently while remaining scoped
       * to the already-verified invitation modal.
       */
      const isSendText =
        /^(?:send|send invitation|send invite|send now)$/i.test(
          buttonText
        );

      const isSendAria =
        /^(?:send|send invitation|send invite|send now)(?:\s+to\s+.+)?$/i.test(
          ariaLabel
        );

      if (
        isSendText ||
        isSendAria
      ) {
        send = el;

        console.log(
          `LinkedIn invitation Send candidate verified: text="${buttonText}" aria="${ariaLabel}"`
        );

        break;
      }
    }

    if (!send) {
      throw new Error(
        "LinkedIn live invitation Send button could not be resolved."
      );
    }

    console.log(
      "LinkedIn live invitation Send button resolved."
    );

    await send.evaluate(
      (node:any) =>
        node.click()
    );

    console.log(
      "LinkedIn live invitation Send button clicked."
    );

    /*
     * Positive verification only.
     *
     * Closing/disappearing modal is NOT proof that LinkedIn
     * accepted the invitation. LinkedIn updates the profile
     * asynchronously, so poll the live page for an explicit
     * post-send state.
     */
    let verified = false;
    let verificationEvidence = "";

    for (
      let attempt = 0;
      attempt < 12;
      attempt++
    ) {
      await page.waitForTimeout(
        attempt === 0 ? 900 : 500
      );

      const finalBody =
        this.normalize(
          await page
            .locator("body")
            .innerText()
            .catch(() => "")
        );

      if (
        /(?:^|\\s)pending(?:\\s|$|•)|invitation sent|invitation was sent|connection request sent/i.test(
          finalBody
        )
      ) {
        verified = true;
        verificationEvidence =
          /invitation sent|invitation was sent|connection request sent/i.test(
            finalBody
          )
            ? "invitation-sent-state"
            : "pending-profile-state";
        break;
      }
    }

    if (!verified) {
      throw new Error(
        "LinkedIn invitation Send action completed but no positive post-send evidence was observed. Refusing false success."
      );
    }

    console.log(
      `LinkedIn invitation sent and verified: ${verificationEvidence}`
    );
  }


  private async openConversation(
    recipient: string,
    company?: string
  ): Promise<void> {

    await this.open();

    const page = this.page;

    const search = await this.resolveSearchInput();

    await search.click();

    await search.fill("");

    await page.waitForTimeout(350);

    await search.fill(recipient);

    const typed =
      await search.inputValue().catch(() => "");

    if (
      this.normalize(typed) !==
      this.normalize(recipient)
    ) {
      throw new Error(
        "LinkedIn recipient search text verification failed."
      );
    }

    await page.waitForTimeout(1800);

    const recipientNorm =
      this.normalize(recipient);

    const companyNorm =
      company
        ? this.normalize(company)
        : "";

    const candidates = page.locator(
      [
        '[role="listitem"]',
        'li',
        'a[href*="/messaging/thread/"]',
        '[data-view-name*="message"]'
      ].join(",")
    );

    const count = Math.min(
      await candidates.count(),
      120
    );

    let best: any = null;
    let bestScore = -1;
    let bestText = "";

    for (let i = 0; i < count; i++) {

      const candidate = candidates.nth(i);

      if (!(await candidate.isVisible().catch(() => false)))
        continue;

      const text =
        this.normalize(
          await candidate.innerText().catch(() => "")
        );

      if (!text)
        continue;

      const nameMatches =
        text.includes(recipientNorm);

      if (!nameMatches)
        continue;

      let score = 300;

      if (
        companyNorm &&
        text.includes(companyNorm)
      ) {
        score += 250;
      }

      const href =
        await candidate
          .getAttribute("href")
          .catch(() => "");

      if (
        href &&
        /\/messaging\/thread\//i.test(href)
      ) {
        score += 100;
      }

      if (score > bestScore) {
        best = candidate;
        bestScore = score;
        bestText = text;
      }
    }

    if (!best) {
      throw new Error(
        `LinkedIn could not find a visible messaging result for ${recipient}.`
      );
    }

    if (
      companyNorm &&
      !bestText.includes(companyNorm)
    ) {
      throw new Error(
        `LinkedIn found ${recipient}, but could not verify company ${company}.`
      );
    }

    await best.scrollIntoViewIfNeeded();

    await page.waitForTimeout(450);

    await best.click();

    await page.waitForTimeout(1400);

    const conversationText =
      this.normalize(
        await page.locator("body").innerText()
      );

    if (!conversationText.includes(recipientNorm)) {
      throw new Error(
        `LinkedIn opened a conversation but recipient verification failed for ${recipient}.`
      );
    }

    console.log(
      `LinkedIn conversation target verified: ${recipient}` +
      (company ? ` | ${company}` : "")
    );
  }

  private async resolveMessageEditor(): Promise<{ editor: any }> {

    const page = this.page;

    for (
      let attempt = 0;
      attempt < 15;
      attempt++
    ) {

      const candidates =
        page.locator(
          [
            '.msg-form__contenteditable[contenteditable="true"]',
            '.msg-form [contenteditable="true"]',
            '.msg-overlay-conversation-bubble [contenteditable="true"]',
            '[role="dialog"] [contenteditable="true"]',
            '[aria-modal="true"] [contenteditable="true"]',
            'div[contenteditable="true"][role="textbox"]',
            'textarea[placeholder*="message" i]'
          ].join(",")
        );

      const count =
        Math.min(
          await candidates.count(),
          80
        );

      let best:any = null;
      let bestScore = -1;

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const el =
          candidates.nth(i);

        if (
          !(await el
            .isVisible()
            .catch(() => false))
        ) {
          continue;
        }

        const score =
          await el.evaluate(
            (node:any) => {

              let score = 0;

              const cls =
                String(
                  node.className || ""
                );

              const role =
                node.getAttribute(
                  "role"
                ) || "";

              const aria =
                node.getAttribute(
                  "aria-label"
                ) || "";

              const placeholder =
                node.getAttribute(
                  "placeholder"
                ) || "";

              if (
                /msg-form__contenteditable/.test(
                  cls
                )
              )
                score += 1000;

              if (
                node.getAttribute(
                  "contenteditable"
                ) === "true"
              )
                score += 500;

              if (role === "textbox")
                score += 400;

              if (
                /message/i.test(
                  aria + " " + placeholder
                )
              )
                score += 300;

              if (
                node.closest(
                  [
                    ".msg-form",
                    ".msg-overlay-conversation-bubble",
                    '[role="dialog"]',
                    '[aria-modal="true"]'
                  ].join(",")
                )
              )
                score += 500;

              return score;
            }
          );

        if (score > bestScore) {
          best = el;
          bestScore = score;
        }
      }

      if (
        best &&
        bestScore >= 700
      ) {

        console.log(
          `LinkedIn live message editor resolved. score=${bestScore}`
        );

        return {
          editor: best
        };
      }

      await page.waitForTimeout(
        300
      );
    }

    throw new Error(
      "LinkedIn live message editor could not be resolved."
    );
  }


  private async fillAndVerify(
    editor: any,
    text: string
  ): Promise<void> {

    const page = this.page;

    await editor.scrollIntoViewIfNeeded();

    await page.waitForTimeout(300);

    await editor.click();

    const tag =
      String(
        await editor
          .evaluate((el:any) => el.tagName || "")
      ).toLowerCase();

    if (
      tag === "textarea" ||
      tag === "input"
    ) {
      await editor.fill(text);
    } else {
      await editor.fill(text).catch(
        async () => {
          await page.keyboard.insertText(text);
        }
      );
    }

    await page.waitForTimeout(350);

    const actual =
      await editor.evaluate(
        (el:any) =>
          "value" in el
            ? el.value
            : (
                el.innerText ||
                el.textContent ||
                ""
              )
      );

    if (
      this.normalize(String(actual)) !==
      this.normalize(text)
    ) {
      throw new Error(
        "LinkedIn message editor text verification failed."
      );
    }

    console.log(
      "LinkedIn message editor filled and verified."
    );
  }

  private async activateSend(
    editor: any
  ): Promise<void> {

    const page = this.page;

    const buttons = page.locator(
      [
        'button[aria-label*="Send" i]',
        'button:has-text("Send")',
        '[role="button"][aria-label*="Send" i]'
      ].join(",")
    );

    const count = Math.min(
      await buttons.count(),
      50
    );

    let sendButton: any = null;

    for (let i = 0; i < count; i++) {

      const candidate = buttons.nth(i);

      if (!(await candidate.isVisible().catch(() => false)))
        continue;

      if (!(await candidate.isEnabled().catch(() => false)))
        continue;

      const text =
        this.normalize(
          (
            await candidate.innerText().catch(() => "")
          ) +
          " " +
          (
            await candidate
              .getAttribute("aria-label")
              .catch(() => "")
          )
        );

      if (
        /\bsend\b/.test(text) &&
        !/send invite|send connection/.test(text)
      ) {
        sendButton = candidate;
        break;
      }
    }

    if (sendButton) {

      await sendButton.scrollIntoViewIfNeeded();

      await page.waitForTimeout(300);

      await sendButton.click();

      console.log(
        "LinkedIn message send button activated."
      );

      return;
    }

    await editor.press("Enter");

    console.log(
      "LinkedIn message send activated with Enter."
    );
  }

  private async verifySentMessage(
    text: string
  ): Promise<boolean> {

    const page = this.page;

    const expected =
      this.normalize(text);

    for (let attempt = 0; attempt < 15; attempt++) {

      const found =
        await page.evaluate(
          ({ expected }: { expected: string }) => {

            const normalize = (value: string) =>
              value
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

            const nodes =
              Array.from(
                document.querySelectorAll(
                  [
                    '[data-event-urn]',
                    'li.msg-s-message-list__event',
                    '.msg-s-event-listitem',
                    '[role="listitem"]'
                  ].join(",")
                )
              );

            return nodes.some(
              (node:any) =>
                normalize(
                  node.innerText ||
                  node.textContent ||
                  ""
                ).includes(expected)
            );
          },
          { expected }
        );

      if (found) {
        console.log(
          "LinkedIn sent message verified in conversation."
        );
        return true;
      }

      await page.waitForTimeout(400);
    }

    return false;
  }

  async sendTargeted(
    request: LinkedInTargetedSendRequest
  ): Promise<LinkedInTargetedSendResult> {

    const recipient =
      String(request.recipient || "").trim();

    const text =
      String(request.text || "").trim();

    const company =
      request.company
        ? String(request.company).trim()
        : undefined;

    if (!recipient) {
      throw new Error(
        "LinkedIn targeted send requires recipient."
      );
    }

    if (!text) {
      throw new Error(
        "LinkedIn targeted send requires message text."
      );
    }

    this.lastPublicContactEmail = undefined;

    let deliveryMode:
      | "message"
      | "invite"
      | "email" = "message";

    if (request.profileUrl) {

      deliveryMode =
        await this.openProfileConversation(
          recipient,
          String(request.profileUrl),
          company
        );

    } else {

      await this.openConversation(
        recipient,
        company
      );
    }

    if (request.dryRun === true) {

      return {
        success: true,
        recipient,
        company,
        conversationVerified: true,
        messageVerified: false,
        dryRun: true
      };
    }

    if (deliveryMode === "email") {

      const publicEmail =
        this.lastPublicContactEmail;

      if (!publicEmail) {
        throw new Error(
          `LinkedIn email fallback selected for ${recipient} without a verified public email.`
        );
      }

      console.log(
        `LinkedIn EMAIL_FALLBACK_READY=${publicEmail}`
      );

      return {
        success: false,
        recipient,
        company,
        conversationVerified: true,
        messageVerified: false,
        dryRun: false,
        deliveryMode: "email",
        publicEmail
      };
    }


    if (deliveryMode === "invite") {

      await this.sendInviteNote(
        recipient,
        String(
          request.inviteText ??
          request.text
        )
      );

      return {
        success: true,
        recipient,
        company,
        conversationVerified: true,
        messageVerified: true,
        dryRun: false,
        deliveryMode: "invite"
      };
    }

    const { editor } =
      await this.resolveMessageEditor();

    await this.fillAndVerify(
      editor,
      text
    );

    await this.activateSend(editor);

    const verified =
      await this.verifySentMessage(text);

    if (!verified) {
      throw new Error(
        `LinkedIn send could not be verified for ${recipient}.`
      );
    }

    return {
      success: true,
      recipient,
      company,
      conversationVerified: true,
      messageVerified: true,
      dryRun: false,
      deliveryMode: "message"
    };
  }

  async send(
    text: string,
    recipient?: string,
    company?: string
  ): Promise<void> {

    if (!recipient) {
      throw new Error(
        "linkedin.send now requires an explicit recipient. Blind sending is disabled."
      );
    }

    await this.sendTargeted({
      recipient,
      company,
      text
    });
  }

  async reply(text: string): Promise<void> {

    if (!text.trim()) {
      throw new Error(
        "LinkedIn reply requires text."
      );
    }

    const { editor } =
      await this.resolveMessageEditor();

    await this.fillAndVerify(
      editor,
      text
    );

    await this.activateSend(editor);

    const verified =
      await this.verifySentMessage(text);

    if (!verified) {
      throw new Error(
        "LinkedIn reply could not be verified."
      );
    }
  }

  async archive(): Promise<void> {
    await this.human.adaptiveClick({
      platform:"linkedin",
      page:"messaging",
      action:"archive",
      description:"Archive conversation"
    });
  }

  async delete(): Promise<void> {
    await this.human.adaptiveClick({
      platform:"linkedin",
      page:"messaging",
      action:"delete",
      description:"Delete conversation"
    });
  }

  async search(query: string): Promise<void> {
    await this.open();
    const input =
      await this.resolveSearchInput();
    await input.fill(query);
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }
}
