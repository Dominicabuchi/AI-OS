import { RedditMCP } from "../RedditMCP";

export class CommentService {

  constructor(

    private readonly mcp: RedditMCP

  ) {}

  async getComments(

    postId: string

  ) {

    return this.mcp.call(

      "get_post_comments",

      {

        postId

      }

    );

  }

  async getMore(

    moreId: string

  ) {

    return this.mcp.call(

      "get_more_comments",

      {

        moreId

      }

    );

  }

  async reply(

    parentId: string,

    text: string

  ) {

    return this.mcp.call(

      "reply_to_post",

      {

        parentId,

        text

      }

    );

  }

  async edit(

    commentId: string,

    text: string

  ) {

    return this.mcp.call(

      "edit_comment",

      {

        commentId,

        text

      }

    );

  }

  async delete(

    commentId: string

  ) {

    return this.mcp.call(

      "delete_comment",

      {

        commentId

      }

    );

  }

}
