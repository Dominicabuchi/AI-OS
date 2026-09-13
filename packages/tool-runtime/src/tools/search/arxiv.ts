import { SearchQuery, SearchResult } from "./index";

export class ArxivSearch {
  async search(_query: SearchQuery): Promise<SearchResult[]> {
    throw new Error("arXiv integration not implemented.");
  }
}
