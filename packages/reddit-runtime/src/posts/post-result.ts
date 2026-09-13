export interface RedditPostResult {

  success: boolean;

  accountId: string;

  subreddit: string;

  postId?: string;

  postUrl?: string;

  createdAt: number;

  duration: number;

  error?: string;

}
