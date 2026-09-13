import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditMCP } from "../mcp";
import { SearchService as MCPSearchService } from "../mcp/services/SearchService";

export class RedditSearch {

  private readonly mcp =
    new RedditMCP();

  private readonly mcpSearch =
    new MCPSearchService(
      this.mcp
    );

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async search(
    query: string
  ) {

    try {

      return await this.mcpSearch.searchPosts({
        query
      });

    } catch (error) {

      console.warn(
        "[RedditSearch] MCP search failed. Falling back to browser.",
        error instanceof Error
          ? error.message
          : error
      );

      await this.human.goto(
        `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`
      );

      return {
        success: true,
        backend: "browser",
        query
      };

    }

  }

  async communities(
    query: string
  ) {

    try {

      return await this.mcpSearch.searchPosts({
        query
      });

    } catch {

      await this.human.goto(
        `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&type=sr`
      );

      return {
        success: true,
        backend: "browser",
        query
      };

    }

  }

  async people(
    query: string
  ) {

    try {

      return await this.mcpSearch.searchPosts({
        query
      });

    } catch {

      await this.human.goto(
        `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&type=user`
      );

      return {
        success: true,
        backend: "browser",
        query
      };

    }

  }

}
