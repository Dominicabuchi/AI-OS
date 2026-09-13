import { RedditMCP } from "../RedditMCP";

export interface CreatePostOptions {

  subreddit: string;

  title: string;

  body?: string;

  url?: string;

  nsfw?: boolean;

  spoiler?: boolean;

}

export class PostService {

  constructor(

    private readonly mcp: RedditMCP

  ) {}

  async create(

    post: CreatePostOptions

  ) {

    return this.mcp.call(

      "create_post",

      post

    );

  }

  async edit(

    postId: string,

    text: string

  ) {

    return this.mcp.call(

      "edit_post",

      {

        postId,

        text

      }

    );

  }

  async delete(

    postId: string

  ) {

    return this.mcp.call(

      "delete_post",

      {

        postId

      }

    );

  }

}
