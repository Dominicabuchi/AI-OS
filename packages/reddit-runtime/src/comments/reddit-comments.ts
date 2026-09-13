import { HumanBrowser } from "@ai-os/browser-runtime";
import { RedditMCP } from "../mcp";
import { CommentService as MCPCommentService } from "../mcp/services/CommentService";

export class RedditComments {

  private readonly mcp =
    new RedditMCP();

  private readonly mcpComments =
    new MCPCommentService(
      this.mcp
    );

  constructor(
    private readonly human: HumanBrowser
  ) {}

  async getComments(
    postId: string
  ) {

    try {

      return await this.mcpComments.getComments(
        postId
      );

    } catch (error) {

      console.warn(
        "[RedditComments] MCP getComments failed. Falling back to browser."
      );

      throw new Error(
        "Browser getComments fallback requires post-page context."
      );

    }

  }

  async getMore(
    moreId: string
  ) {

    try {

      return await this.mcpComments.getMore(
        moreId
      );

    } catch {

      throw new Error(
        "Browser getMoreComments fallback not implemented yet."
      );

    }

  }

  async reply(
    parentId: string,
    text: string
  ) {

    try {

      return await this.mcpComments.reply(
        parentId,
        text
      );

    } catch (error) {

      console.warn(
        "[RedditComments] MCP reply failed. Falling back to browser."
      );

      throw new Error(
        "Browser reply fallback not implemented yet."
      );

    }

  }

  async edit(
    commentId: string,
    text: string
  ) {

    try {

      return await this.mcpComments.edit(
        commentId,
        text
      );

    } catch {

      throw new Error(
        "Browser edit-comment fallback not implemented yet."
      );

    }

  }

  async delete(
    commentId: string
  ) {

    try {

      return await this.mcpComments.delete(
        commentId
      );

    } catch {

      throw new Error(
        "Browser delete-comment fallback not implemented yet."
      );

    }

  }

  async upvote(
    thingId: string
  ) {

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "post-or-comment",
      action: "upvote",
      description: `Upvote Reddit item ${thingId}`
    });

    return {
      success: true,
      backend: "browser",
      thingId,
      action: "upvote"
    };

  }

  async downvote(
    thingId: string
  ) {

    await this.human.adaptiveClick({
      platform: "reddit",
      page: "post-or-comment",
      action: "downvote",
      description: `Downvote Reddit item ${thingId}`
    });

    return {
      success: true,
      backend: "browser",
      thingId,
      action: "downvote"
    };

  }

}
