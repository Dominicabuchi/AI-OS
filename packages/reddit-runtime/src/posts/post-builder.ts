import {
  RedditPost
} from "./post-types";

export class PostBuilder {

  build(
    post: RedditPost
  ): RedditPost {

    return {

      ...post,

      title: post.title.trim(),

      body: post.body?.trim(),

      subreddit:
        post.subreddit
          .replace(/^r\//, "")
          .trim()

    };

  }

}
