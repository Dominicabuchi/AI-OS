import { BrowserSearch } from "../browser-search";
import { ArxivSearch } from "../arxiv";
import {
  SearchQuery,
  SearchResult
} from "../index";

export class SearchOrchestrator {
  private readonly browser =
    new BrowserSearch();

  private readonly arxiv =
    new ArxivSearch();

  async search(
    query: SearchQuery
  ): Promise<SearchResult[]> {

    const results =
      await this.browser.search(query);

    const q =
      query.query.toLowerCase();

    if (
      q.includes("paper") ||
      q.includes("research") ||
      q.includes("arxiv")
    ) {

      const papers =
        await this.arxiv.search(query);

      results.push(...papers);

    }

    return results;

  }

}
