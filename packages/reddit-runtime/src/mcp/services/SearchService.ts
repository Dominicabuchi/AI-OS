import { RedditMCP } from "../RedditMCP";

export interface SearchPostsOptions {

  query: string;

  subreddit?: string;

  sort?: "relevance" | "new" | "top" | "comments";

  limit?: number;

}

export class SearchService {

  constructor(

    private readonly mcp: RedditMCP

  ) {}

  async searchPosts(

    options: SearchPostsOptions

  ) {

    return this.mcp.call(

      "search_reddit",

      {

        query: options.query,

        subreddit: options.subreddit,

        sort: options.sort ?? "relevance",

        limit: options.limit ?? 25

      }

    );

  }

}
