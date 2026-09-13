import { LinkedInAuthor } from "./linkedin-author";
import { LinkedInMedia } from "./linkedin-media";

export interface LinkedInPost {
  id: string;
  urn?: string;
  url?: string;

  author: LinkedInAuthor;

  text: string;

  timestamp?: string;

  sponsored: boolean;

  media: LinkedInMedia[];

  likes: number;
  comments: number;
  reposts: number;
}
