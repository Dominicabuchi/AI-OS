export enum RedditPostType {

  TEXT = "text",

  LINK = "link",

  IMAGE = "image",

  GALLERY = "gallery",

  VIDEO = "video",

  CROSSPOST = "crosspost"

}

export interface RedditPost {

  accountId?: string;

  subreddit: string;

  type?: RedditPostType;

  title: string;

  body?: string;

  url?: string;

  images?: string[];

  video?: string;

  crosspostId?: string;

  nsfw?: boolean;

  spoiler?: boolean;

  flairId?: string;

}
