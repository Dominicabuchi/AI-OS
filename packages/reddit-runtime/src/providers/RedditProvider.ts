import { RedditMCP } from "../mcp/RedditMCP";

import { CapabilityRouter, Backend } from "./CapabilityRouter";

import { BrowserProvider } from "./browser/BrowserProvider";

import { SearchService } from "../mcp/services/SearchService";
import { PostService } from "../mcp/services/PostService";
import { CommentService } from "../mcp/services/CommentService";
import { UserService } from "../mcp/services/UserService";
import { SubredditService } from "../mcp/services/SubredditService";

export class RedditProvider {

  readonly mcp = new RedditMCP();

  readonly router =
    new CapabilityRouter();

  readonly browser:
    BrowserProvider;

  constructor(
    browser: BrowserProvider
  ) {
    this.browser = browser;
  }

  readonly search =
    new SearchService(this.mcp);

  readonly posts =
    new PostService(this.mcp);

  readonly comments =
    new CommentService(this.mcp);

  readonly users =
    new UserService(this.mcp);

  readonly subreddits =
    new SubredditService(this.mcp);

  backend(
    capability: string
  ) {

    return this.router.backend(
      capability
    );

  }


  async createPost(post: any) {

    switch (

      this.router.backend(

        "createPost"

      )

    ) {

      case Backend.MCP:

        try {

          return await this.posts.create(
            post
          );

        } catch (error) {

          console.warn(

            "MCP createPost failed, falling back to browser."

          );

          return this.browser.createPost(
            post
          );

        }

      default:

        return this.browser.createPost(
          post
        );

    }

  }

}
