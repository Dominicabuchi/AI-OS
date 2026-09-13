import {
  SearchQuery,
  SearchResult
} from "./index";

function decodeHtml(
  value: string
): string {

  return value
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, hex) =>
        String.fromCodePoint(
          parseInt(hex, 16)
        )
    )
    .replace(
      /&#([0-9]+);/g,
      (_, decimal) =>
        String.fromCodePoint(
          parseInt(decimal, 10)
        )
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();

}

function stripHtml(
  value: string
): string {

  return decodeHtml(
    value.replace(
      /<[^>]+>/g,
      " "
    )
  )
    .replace(/\s+/g, " ")
    .trim();

}

function normalizeResultUrl(
  rawUrl: string
): string {

  const decoded =
    decodeHtml(rawUrl);

  let candidate =
    decoded;

  if (
    candidate.startsWith("//")
  ) {
    candidate =
      "https:" + candidate;
  }

  try {

    const parsed =
      new URL(candidate);

    if (
      parsed.hostname ===
        "duckduckgo.com" &&
      parsed.pathname === "/l/"
    ) {

      const destination =
        parsed.searchParams.get(
          "uddg"
        );

      if (destination) {
        return destination;
      }

    }

    return parsed.toString();

  } catch {

    return candidate;

  }

}

export class BrowserSearch {

  async search(
    query: SearchQuery,
  ): Promise<SearchResult[]> {

    const text =
      query.query.trim();

    if (!text) {
      return [];
    }

    const limit =
      Math.max(
        1,
        Math.min(
          Number(
            query.limit ?? 10
          ),
          20
        )
      );

    const url =
      "https://html.duckduckgo.com/html/?q=" +
      encodeURIComponent(text);

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        20_000
      );

    try {

      const response =
        await fetch(
          url,
          {
            method: "GET",

            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36",

              "Accept":
                "text/html,application/xhtml+xml"
            },

            signal:
              controller.signal
          }
        );

      if (!response.ok) {

        throw new Error(
          `DuckDuckGo search failed with HTTP ${response.status}`
        );

      }

      const html =
        await response.text();

      const titleRegex =
        /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

      const snippetRegex =
        /<(?:a|div)[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div)>/gi;

      const titles: Array<{
        url: string;
        title: string;
      }> = [];

      const snippets: string[] =
        [];

      let match:
        RegExpExecArray | null;

      while (
        (
          match =
            titleRegex.exec(html)
        ) !== null
      ) {

        const title =
          stripHtml(
            match[2] ?? ""
          );

        const resultUrl =
          normalizeResultUrl(
            match[1] ?? ""
          );

        if (
          !title ||
          !resultUrl
        ) {
          continue;
        }

        titles.push({
          title,
          url: resultUrl
        });

      }

      while (
        (
          match =
            snippetRegex.exec(
              html
            )
        ) !== null
      ) {

        snippets.push(
          stripHtml(
            match[1] ?? ""
          )
        );

      }

      const results:
        SearchResult[] = [];

      for (
        let i = 0;
        i < titles.length &&
        results.length < limit;
        i++
      ) {

        const item =
          titles[i];

        results.push({
          title:
            item.title,

          url:
            item.url,

          snippet:
            snippets[i] ?? "",

          source:
            "duckduckgo",

          metadata: {
            query: text,
            transport:
              "html"
          }
        });

      }

      if (
        results.length === 0
      ) {
        const liteUrl =
          "https://lite.duckduckgo.com/lite/?q=" +
          encodeURIComponent(text);

        const liteController =
          new AbortController();

        const liteTimeout =
          setTimeout(
            () => liteController.abort(),
            20_000
          );

        try {
          const liteResponse =
            await fetch(
              liteUrl,
              {
                method: "GET",
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36",
                  "Accept":
                    "text/html,application/xhtml+xml"
                },
                signal:
                  liteController.signal
              }
            );

          if (liteResponse.ok) {
            const liteHtml =
              await liteResponse.text();

            const anchorRegex =
              /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

            const seen =
              new Set<string>();

            let anchorMatch:
              RegExpExecArray | null;

            while (
              (
                anchorMatch =
                  anchorRegex.exec(
                    liteHtml
                  )
              ) !== null &&
              results.length < limit
            ) {
              const candidateUrl =
                normalizeResultUrl(
                  anchorMatch[1] ?? ""
                );

              const candidateTitle =
                stripHtml(
                  anchorMatch[2] ?? ""
                );

              if (
                !candidateUrl ||
                !candidateTitle
              ) {
                continue;
              }

              let parsed:
                URL;

              try {
                parsed =
                  new URL(
                    candidateUrl
                  );
              } catch {
                continue;
              }

              if (
                parsed.protocol !== "http:" &&
                parsed.protocol !== "https:"
              ) {
                continue;
              }

              if (
                parsed.hostname.endsWith(
                  "duckduckgo.com"
                )
              ) {
                continue;
              }

              const normalizedUrl =
                parsed.toString();

              if (
                seen.has(
                  normalizedUrl
                )
              ) {
                continue;
              }

              seen.add(
                normalizedUrl
              );

              results.push({
                title:
                  candidateTitle,
                url:
                  normalizedUrl,
                snippet:
                  "",
                source:
                  "duckduckgo",
                metadata: {
                  query:
                    text,
                  transport:
                    "lite-fallback"
                }
              });
            }
          }
        } finally {
          clearTimeout(
            liteTimeout
          );
        }
      }

      if (
        results.length === 0
      ) {
        throw new Error(
          "DuckDuckGo search returned no parseable results from HTML or Lite transports."
        );
      }

      return results;

    } catch (error) {

      if (
        error instanceof Error &&
        error.name ===
          "AbortError"
      ) {

        throw new Error(
          "DuckDuckGo search timed out after 20000ms"
        );

      }

      throw error;

    } finally {

      clearTimeout(
        timeout
      );

    }

  }

}
