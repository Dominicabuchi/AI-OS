export enum Backend {

  MCP = "mcp",

  Browser = "browser"

}

export class CapabilityRouter {

  private readonly mcpCapabilities =
    new Set([

      "searchPosts",

      "browseSubreddit",

      "getSubredditInfo",

      "getSubredditRules",

      "getPostFlairs",

      "getTopPosts",

      "getTrendingSubreddits",

      "createPost",

      "editPost",

      "deletePost",

      "getComments",

      "getMoreComments",

      "reply",

      "editComment",

      "deleteComment",

      "getUser",

      "getUserPosts",

      "getUserComments"

    ]);

  backend(

    capability: string

  ): Backend {

    if (

      this.mcpCapabilities.has(

        capability

      )

    ) {

      return Backend.MCP;

    }

    return Backend.Browser;

  }

}
