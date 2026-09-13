import { Tool } from "../../types/tool";
import { BrowserSearch } from "./browser-search";

export interface SearchQuery {
  query: string;
  limit?: number;
  options?: Record<string, unknown>;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export class SearchTool implements Tool {
  readonly id = "search";
  readonly name = "Search";
  readonly description =
    "Browser-powered internet intelligence search.";

  private readonly browserSearch = new BrowserSearch();

  canExecute(action: string): boolean {
    return action === "search" || action.startsWith("search.");
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case "search":
      case "search.web":
        return this.search({
          query: String(payload.query ?? ""),
          limit: payload.limit as number | undefined,
          options: payload.options as Record<string, unknown> | undefined,
        });

      default:
        throw new Error(`Unsupported search action: ${action}`);
    }
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    return this.browserSearch.search(query);
  }
}
