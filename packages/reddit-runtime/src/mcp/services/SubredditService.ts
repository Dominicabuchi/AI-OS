import { RedditMCP } from "../RedditMCP";

export class SubredditService {

  constructor(

    private readonly mcp: RedditMCP

  ) {}

  async browse(

    subreddit: string,

    sort = "hot",

    limit = 25

  ) {

    return this.mcp.call(

      "browse_subreddit",

      {

        subreddit,

        sort,

        limit

      }

    );

  }

  async getInfo(

    subreddit: string

  ) {

    return this.mcp.call(

      "get_subreddit_info",

      {

        subreddit

      }

    );

  }

  async getRules(

    subreddit: string

  ) {

    return this.mcp.call(

      "get_subreddit_rules",

      {

        subreddit

      }

    );

  }

  async getFlairs(

    subreddit: string

  ) {

    return this.mcp.call(

      "get_post_flairs",

      {

        subreddit

      }

    );

  }

  async getTop(

    subreddit: string,

    limit = 25

  ) {

    return this.mcp.call(

      "get_top_posts",

      {

        subreddit,

        limit

      }

    );

  }

  async trending() {

    return this.mcp.call(

      "get_trending_subreddits",

      {}

    );

  }

}
