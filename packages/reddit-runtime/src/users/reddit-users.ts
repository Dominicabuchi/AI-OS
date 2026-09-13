import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditMCP } from "../mcp";
import { UserService as MCPUserService } from "../mcp/services/UserService";

export class RedditUsers {

  private readonly mcp = new RedditMCP();

  private readonly mcpUsers =
    new MCPUserService(this.mcp);

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async profile(username: string) {

    try {

      return await this.mcpUsers.getUser(
        username
      );

    } catch (error) {

      console.warn(
        "[RedditUsers] MCP getUser failed. Falling back to browser.",
        error instanceof Error
          ? error.message
          : error
      );

      await this.human.goto(
        `https://www.reddit.com/user/${username}`
      );

      return {
        success: true,
        backend: "browser",
        username
      };

    }

  }

  async posts(
    username: string,
    limit = 25
  ) {

    try {

      return await this.mcpUsers.getPosts(
        username,
        limit
      );

    } catch (error) {

      console.warn(
        "[RedditUsers] MCP getPosts failed. Falling back to browser.",
        error instanceof Error
          ? error.message
          : error
      );

      await this.human.goto(
        `https://www.reddit.com/user/${username}/submitted/`
      );

      return {
        success: true,
        backend: "browser",
        username
      };

    }

  }

  async comments(
    username: string,
    limit = 25
  ) {

    try {

      return await this.mcpUsers.getComments(
        username,
        limit
      );

    } catch (error) {

      console.warn(
        "[RedditUsers] MCP getComments failed. Falling back to browser.",
        error instanceof Error
          ? error.message
          : error
      );

      await this.human.goto(
        `https://www.reddit.com/user/${username}/comments/`
      );

      return {
        success: true,
        backend: "browser",
        username
      };

    }

  }

}
