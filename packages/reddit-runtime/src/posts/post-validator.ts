import {
  RedditPost,
  RedditPostType
} from "./post-types";

export class PostValidator {

  validate(
    post: RedditPost
  ): void {

    if (!post.subreddit?.trim()) {
      throw new Error(
        "Subreddit is required."
      );
    }

    if (!post.title?.trim()) {
      throw new Error(
        "Title is required."
      );
    }

    if (!post.type) {

      if (post.images?.length) {
        post.type = RedditPostType.IMAGE;
      }

      else if (post.url) {
        post.type = RedditPostType.LINK;
      }

      else {
        post.type = RedditPostType.TEXT;
      }

    }

  }

}
