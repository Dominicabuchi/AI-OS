import { HumanBrowser } from "@ai-os/browser-runtime";

import { LinkedInProfile } from "../types/linkedin-profile";
import { LinkedInCompany } from "../types/linkedin-company";
import { LinkedInJob } from "../types/linkedin-job";
import { LinkedInPost } from "../types/linkedin-post";
import { LinkedInSearchResult } from "../types/linkedin-search-result";

export class LinkedInSearch {

  private cursor = 0;

  constructor(
    private readonly human: HumanBrowser
  ) {}

  private get page(): any {
    return (this.human as any).page;
  }

  private async waitAndCheckAuth(): Promise<void> {

    await this.page.waitForTimeout(1600);

    const url = this.page.url();

    if (
      /\/login|\/checkpoint|\/challenge/i.test(url)
    ) {
      throw new Error(
        `LinkedIn authentication required: ${url}`
      );
    }
  }

  private async extractProfileResults(): Promise<LinkedInProfile[]> {

    return await this.page.evaluate(() => {

      const normalizeUrl = (raw: string) => {
        try {
          const u = new URL(raw);
          u.search = "";
          return u.toString();
        } catch {
          return raw;
        }
      };

      const seen = new Set<string>();
      const results: any[] = [];

      const anchors =
        Array.from(
          document.querySelectorAll(
            'a[href*="/in/"]'
          )
        );

      for (const anchor of anchors as any[]) {

        const href =
          normalizeUrl(anchor.href || "");

        if (
          !href ||
          seen.has(href)
        ) {
          continue;
        }

        const container =
          anchor.closest(
            'li, [role="listitem"], .reusable-search__result-container'
          ) ||
          anchor.parentElement;

        const text =
          (
            container?.innerText ||
            anchor.innerText ||
            ""
          )
            .replace(/\s+/g, " ")
            .trim();

        if (!text)
          continue;

        seen.add(href);

        const lines =
          text
            .split(/\n+/)
            .map((x:string)=>x.trim())
            .filter(Boolean);

        results.push({
          id: href,
          name:
            (
              anchor.innerText ||
              lines[0] ||
              ""
            ).trim(),
          headline:
            lines.slice(1, 4).join(" | "),
          location: "",
          url: href
        });

        if (results.length >= 30)
          break;
      }

      return results;
    });
  }

  async search(
    query: string
  ): Promise<LinkedInSearchResult[]> {

    await this.human.goto(
      `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`
    );

    await this.waitAndCheckAuth();

    return await this.page.evaluate(() =>
      Array.from(
        document.querySelectorAll("a")
      )
        .slice(0, 80)
        .map((a:any)=>({
          id:a.href,
          type:"person",
          title:
            (a.innerText || "")
              .replace(/\s+/g, " ")
              .trim(),
          subtitle:"",
          url:a.href
        }))
        .filter(
          (item:any) =>
            item.title &&
            item.url
        )
    );
  }

  async people(query: string): Promise<LinkedInProfile[]> {

    await this.human.goto(
      `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`
    );

    const page:any = (this.human as any).page;

    await page.evaluate(() => {

      const w:any = window as any;

      if (w.__AI_OS_LINKEDIN_SALES_CLICK_GUARD__)
        return;

      w.__AI_OS_LINKEDIN_SALES_CLICK_GUARD__ = true;

      document.addEventListener(
        "click",
        (event:any) => {

          const target =
            event.target?.closest?.(
              'button, a, [role="button"]'
            );

          if (!target)
            return;

          const text =
            String(
              [
                target.innerText,
                target.textContent,
                target.getAttribute?.("aria-label"),
                target.getAttribute?.("title")
              ].join(" ")
            )
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();

          const inGlobalNavigation =
            Boolean(
              target.closest?.(
                [
                  "header",
                  "nav",
                  ".global-nav",
                  '[class*="global-nav"]'
                ].join(",")
              )
            );

          const forbidden =
            inGlobalNavigation &&
            (
              text === "for business" ||
              text === "work" ||
              text.includes("for business") ||
              text.includes("work apps") ||
              text.includes("my apps")
            );

          if (forbidden) {

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            console.warn(
              "AI-OS blocked forbidden LinkedIn global-nav click:",
              text
            );

            return false;
          }
        },
        true
      );
    });
    await page.waitForTimeout(2600);

    if (/\/login|\/checkpoint|\/challenge/i.test(page.url())) {
      throw new Error(`LinkedIn authentication required: ${page.url()}`);
    }

    const results = await page.evaluate(() => {

      const norm = (v:string) =>
        String(v || "").replace(/\s+/g, " ").trim();

      const seen = new Set<string>();
      const out:any[] = [];

      for (const anchor of Array.from(
        document.querySelectorAll('a[href*="/in/"]')
      ) as HTMLAnchorElement[]) {

        let url = anchor.href || "";
        if (!url) continue;

        try {
          const u = new URL(url);
          u.search = "";
          u.hash = "";
          url = u.toString();
        } catch {}

        if (seen.has(url)) continue;

        const anchorText = norm(
          anchor.innerText || anchor.textContent || ""
        );

        const name = anchorText
          .replace(/\s*[•·]\s*(1st|2nd|3rd\+?).*$/i, "")
          .trim();

        if (!name || name.length > 90) continue;

        let node:Element|null = anchor.parentElement;
        let cardText = anchorText;

        for (let depth = 0; depth < 8 && node; depth++) {
          const text = norm(
            (node as HTMLElement).innerText ||
            node.textContent ||
            ""
          );

          if (
            text.length >= name.length + 15 &&
            text.length <= 1200
          ) {
            cardText = text;
            break;
          }

          node = node.parentElement;
        }

        seen.add(url);

        out.push({
          id: url,
          name,
          headline: cardText,
          location: "",
          url
        });

        if (out.length >= 30) break;
      }

      return out;
    });

    console.log(
      `LinkedIn exact people search returned ${results.length} live results.`
    );

    return results;
  }

  async companies(
    query: string
  ): Promise<LinkedInCompany[]> {

    await this.human.goto(
      `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(query)}`
    );

    await this.waitAndCheckAuth();

    return await this.page.evaluate(() => {

      const seen = new Set<string>();
      const results:any[] = [];

      for (
        const a of
        Array.from(
          document.querySelectorAll(
            'a[href*="/company/"]'
          )
        ) as any[]
      ) {

        const href = a.href || "";

        if (!href || seen.has(href))
          continue;

        const container =
          a.closest(
            'li, [role="listitem"], .reusable-search__result-container'
          ) ||
          a.parentElement;

        const text =
          (
            container?.innerText ||
            a.innerText ||
            ""
          )
            .replace(/\s+/g, " ")
            .trim();

        if (!text)
          continue;

        seen.add(href);

        results.push({
          id:href,
          name:
            (a.innerText || text)
              .replace(/\s+/g, " ")
              .trim(),
          industry:"",
          location:"",
          url:href
        });

        if (results.length >= 30)
          break;
      }

      return results;
    });
  }

  async jobs(query: string): Promise<LinkedInJob[]> {

    const jobsUrl =
      `https://www.linkedin.com/jobs/search-results/?keywords=${encodeURIComponent(query)}`;

    let navigationSucceeded = false;
    let lastNavigationError:any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {

      try {

        await this.human.goto(jobsUrl);

        navigationSucceeded = true;

        break;

      } catch (error:any) {

        lastNavigationError = error;

        const message =
          String(
            error?.message ||
            error ||
            ""
          );

        if (
          !/ERR_ABORTED|frame was detached|Navigation interrupted/i.test(
            message
          )
        ) {
          throw error;
        }

        console.log(
          `LinkedIn Jobs navigation transiently aborted; retry ${attempt}/3.`
        );

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              700 * attempt
            )
        );
      }
    }

    if (!navigationSucceeded) {
      throw lastNavigationError;
    }

    const page:any = (this.human as any).page;

    await page.evaluate(() => {

      const w:any = window as any;

      if (w.__AI_OS_LINKEDIN_SALES_CLICK_GUARD__)
        return;

      w.__AI_OS_LINKEDIN_SALES_CLICK_GUARD__ = true;

      document.addEventListener(
        "click",
        (event:any) => {

          const target =
            event.target?.closest?.(
              'button, a, [role="button"]'
            );

          if (!target)
            return;

          const text =
            String(
              [
                target.innerText,
                target.textContent,
                target.getAttribute?.("aria-label"),
                target.getAttribute?.("title")
              ].join(" ")
            )
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();

          const inGlobalNavigation =
            Boolean(
              target.closest?.(
                [
                  "header",
                  "nav",
                  ".global-nav",
                  '[class*="global-nav"]'
                ].join(",")
              )
            );

          const forbidden =
            inGlobalNavigation &&
            (
              text === "for business" ||
              text === "work" ||
              text.includes("for business") ||
              text.includes("work apps") ||
              text.includes("my apps")
            );

          if (forbidden) {

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            console.warn(
              "AI-OS blocked forbidden LinkedIn global-nav click:",
              text
            );

            return false;
          }
        },
        true
      );
    });
    await page.waitForTimeout(3200);

    if (/\/login|\/checkpoint|\/challenge/i.test(page.url())) {
      throw new Error(`LinkedIn authentication required: ${page.url()}`);
    }

    const results = await page.evaluate(() => {

      const norm = (v:string) =>
        String(v || "").replace(/\s+/g, " ").trim();

      const seen = new Set<string>();
      const out:any[] = [];

      const buttons = Array.from(
        document.querySelectorAll(
          '[aria-label*="Dismiss"][aria-label*="job" i]'
        )
      ) as HTMLElement[];

      for (const button of buttons) {

        const aria = button.getAttribute("aria-label") || "";

        const match = aria.match(
          /dismiss\s+(.+?)\s+job/i
        );

        if (!match) continue;

        const title = norm(match[1]);

        let card:Element|null = button.parentElement;
        let lines:string[] = [];
        let raw = "";

        for (let depth = 0; depth < 10 && card; depth++) {

          raw =
            (card as HTMLElement).innerText ||
            card.textContent ||
            "";

          lines = raw
            .split(/\n+/)
            .map((x:string) => norm(x))
            .filter(Boolean);

          if (
            lines.length >= 2 &&
            lines.some(
              (line:string) =>
                line.toLowerCase().includes(
                  title.toLowerCase()
                )
            )
          ) {
            break;
          }

          card = card.parentElement;
        }

        if (!card) continue;

        let company = "";

        const companyLink = card.querySelector(
          'a[href*="/company/"]'
        ) as HTMLAnchorElement|null;

        if (companyLink) {
          company = norm(
            companyLink.innerText ||
            companyLink.textContent ||
            ""
          );
        }

        if (!company) {

          const titleIndex = lines.findIndex(
            (line:string) =>
              line.toLowerCase() === title.toLowerCase() ||
              line.toLowerCase().includes(
                title.toLowerCase()
              )
          );

          if (titleIndex >= 0) {

            for (
              let i = titleIndex + 1;
              i < Math.min(lines.length, titleIndex + 7);
              i++
            ) {

              const candidate = lines[i]
                .replace(/^\(verified job\)\s*/i, "")
                .trim();

              if (!candidate) continue;

              if (
                /^(easy apply|promoted|actively recruiting|reposted|posted|saved|viewed)$/i.test(
                  candidate
                )
              ) continue;

              if (
                /^(toronto|canada|united states|remote|hybrid|on-site)\b/i.test(
                  candidate
                )
              ) continue;

              if (
                /^\d+\s+(applicant|applicants|hour|hours|day|days|week|weeks|month|months)/i.test(
                  candidate
                )
              ) continue;

              if (
                candidate.toLowerCase().includes(
                  title.toLowerCase()
                )
              ) continue;

              company = candidate;
              break;
            }
          }
        }

        company = company
          .replace(/^\(verified job\)\s*/i, "")
          .replace(/\s+(posted|reposted)\b.*$/i, "")
          .replace(
            /\s+\d+\s+(hours?|days?|weeks?|months?)\s+ago.*$/i,
            ""
          )
          .trim();

        if (
          !company ||
          company.length > 100 ||
          /\bapplicants?\b|\bverified job\b/i.test(company)
        ) continue;

        const jobLink = card.querySelector(
          'a[href*="/jobs/"]'
        ) as HTMLAnchorElement|null;

        const url = jobLink?.href || "";
        const description = norm(raw);
        const key = `${title}|${company}|${url}`;

        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          id: url || key,
          title,
          company,
          location: "",
          url,
          description
        });

        if (out.length >= 40) break;
      }

      return out;
    });

    console.log(
      `LinkedIn exact jobs search returned ${results.length} live results.`
    );

    return results;
  }

async posts(
    query: string
  ): Promise<LinkedInPost[]> {

    await this.human.goto(
      `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(query)}`
    );

    await this.waitAndCheckAuth();

    return [];
  }

  async recruiters(
    query: string
  ): Promise<LinkedInProfile[]> {
    return this.people(
      query + " recruiter"
    );
  }

  async hiringManagers(
    query: string
  ): Promise<LinkedInProfile[]> {
    return this.people(
      query +
      ' ("Head of Talent" OR "Talent Acquisition" OR "Recruiting" OR "Founder" OR "CEO" OR "Hiring Manager")'
    );
  }

  async employees(
    company: string
  ): Promise<LinkedInProfile[]> {
    return this.people(company);
  }

  filter<T>(
    results: T[],
    predicate: (item: T) => boolean
  ): T[] {
    return results.filter(predicate);
  }

  async next(): Promise<void> {
    this.cursor++;
    await this.human.scroll();
  }
}
