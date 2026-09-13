export interface XAuthor {
  id?: string;
  username: string;
  displayName?: string;
  verified?: boolean;
}

export interface XMedia {
  type: "image" | "video" | "gif";
  url?: string;
}

export interface XPost {
  id: string;
  text: string;
  author: XAuthor;

  timestamp?: string;

  media?: XMedia[];

  replies?: number;
  reposts?: number;
  likes?: number;
  views?: number;

  bookmarked?: boolean;
  liked?: boolean;
}

export interface XProfile {
  username: string;
  displayName?: string;
  bio?: string;

  followers?: number;
 following?: number;

  verified?: boolean;

  location?: string;
  website?: string;
}

export interface XSearchOptions {

  query: string;

  from?: string;

  since?: string;
  until?: string;

  language?: string;

  minLikes?: number;
  minReplies?: number;
  minReposts?: number;

}
