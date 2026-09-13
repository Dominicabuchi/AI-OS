import { RedditMCP } from "../RedditMCP";

export class UserService {

  constructor(

    private readonly mcp: RedditMCP

  ) {}

  async getUser(

    username: string

  ) {

    return this.mcp.call(

      "get_user_info",

      {

        username

      }

    );

  }

  async getPosts(

    username: string,

    limit = 25

  ) {

    return this.mcp.call(

      "get_user_posts",

      {

        username,

        limit

      }

    );

  }

  async getComments(

    username: string,

    limit = 25

  ) {

    return this.mcp.call(

      "get_user_comments",

      {

        username,

        limit

      }

    );

  }

}
