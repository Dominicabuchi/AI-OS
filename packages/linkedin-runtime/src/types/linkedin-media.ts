export type MediaType =
  | "image"
  | "video"
  | "document"
  | "link";

export interface LinkedInMedia {
  type: MediaType;
  url: string;
  thumbnail?: string;
  title?: string;
}
