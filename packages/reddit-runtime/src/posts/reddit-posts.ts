import { AccountManager } from "../accounts";

import {
  RedditPost
} from "./post-types";

import {
  RedditPostResult
} from "./post-result";

import {
  PostValidator
} from "./post-validator";

import {
  PostBuilder
} from "./post-builder";

import {
  PostService
} from "./post-service";

export class RedditPosts {

  readonly accounts =
    new AccountManager();

  readonly validator =
    new PostValidator();

  readonly builder =
    new PostBuilder();

  constructor(
    readonly human?: unknown
  ) {}

  async publish(
    post: RedditPost
  ): Promise<RedditPostResult> {

    this.validator.validate(post);

    post =
      this.builder.build(post);

    const accountId =
      post.accountId ??
      "recruiter-main";

    const context =
      await this.accounts.launch(
        accountId
      );

    const page =
      context.pages()[0] ??
      await context.newPage();

    const service =
      new PostService(page);

    const started =
      Date.now();

    try {

      const result =
        await service.publish(
          post
        );

      return {

        success: result.success,

        accountId,

        subreddit: post.subreddit,

        postId: result.postId,

        postUrl: result.postUrl,

        createdAt: Date.now(),

        duration:
          Date.now() - started

      };

    }

    finally {

      await context.close();

    }

  }

  async create(
    post: RedditPost
  ): Promise<RedditPostResult> {

    return this.publish(post);

  }

}
