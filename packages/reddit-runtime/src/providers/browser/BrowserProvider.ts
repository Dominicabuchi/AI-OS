import { RedditPosts } from "../../posts/reddit-posts";
import { RedditPost } from "../../posts/post-types";

export class BrowserProvider {

  readonly posts =
    new RedditPosts();

  async createPost(
    post: RedditPost
  ) {

    return this.posts.publish(
      post
    );

  }

  async joinSubreddit(
    subreddit: string
  ) {

    throw new Error(
      "joinSubreddit not implemented."
    );

  }

  async leaveSubreddit(
    subreddit: string
  ) {

    throw new Error(
      "leaveSubreddit not implemented."
    );

  }

  async upvote(
    thingId: string
  ) {

    throw new Error(
      "upvote not implemented."
    );

  }

  async downvote(
    thingId: string
  ) {

    throw new Error(
      "downvote not implemented."
    );

  }

}
